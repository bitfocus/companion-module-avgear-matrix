import {
	InstanceBase,
	InstanceStatus,
	TCPHelper,
	type InstanceTypes,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
export { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import http from 'node:http'

interface MatrixInstanceTypes extends InstanceTypes {
	config: ModuleConfig
	secrets: undefined
}

export default class ModuleInstance extends InstanceBase<MatrixInstanceTypes> {
	config!: ModuleConfig

	private socket?: TCPHelper
	private rxBuffer = ''
	private pollTimer?: NodeJS.Timeout
	private labelPollTimer?: NodeJS.Timeout
	private postActionVideoPollTimer?: NodeJS.Timeout

	private pendingStatusHeader = false
	private pendingStatusLineIndex = 0

	public routes: Record<number, number> = {}
	public inputLabels: Record<string, string> = {}
	public outputLabels: Record<string, string> = {}

	public isOn: boolean | undefined = undefined
	public outputPowerStates: Record<number, boolean | undefined> = {}
	public guiIp = ''
	public titleBar = ''
	public lcdReadout = ''

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = this.applyConfigDefaults(config)

		this.inputLabels = this.normalizeCachedLabels(this.config.cachedInputLabels)
		this.outputLabels = this.normalizeCachedLabels(this.config.cachedOutputLabels)

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.updateAllVariableValues()

		setTimeout(() => {
			this.log('debug', 'Init fallback label fetch')
			void this.fetchLabels()
		}, 2000)

		this.initConnection()
	}

	async destroy(): Promise<void> {
		this.log('debug', 'destroy')

		this.stopPolling()
		this.stopLabelPolling()

		if (this.postActionVideoPollTimer) {
			clearTimeout(this.postActionVideoPollTimer)
			this.postActionVideoPollTimer = undefined
		}

		this.socket?.destroy()
		this.socket = undefined
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = this.applyConfigDefaults(config)

		this.inputLabels = this.normalizeCachedLabels(this.config.cachedInputLabels)
		this.outputLabels = this.normalizeCachedLabels(this.config.cachedOutputLabels)

		this.stopPolling()
		this.stopLabelPolling()

		if (this.postActionVideoPollTimer) {
			clearTimeout(this.postActionVideoPollTimer)
			this.postActionVideoPollTimer = undefined
		}

		this.socket?.destroy()
		this.socket = undefined

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateAllVariableValues()

		this.initConnection()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	private applyConfigDefaults(config: ModuleConfig): ModuleConfig {
		return {
			host: config.host?.trim() || '192.168.0.178',
			port: typeof config.port === 'number' && config.port > 0 ? config.port : 4001,
			pollIntervalMs:
				typeof config.pollIntervalMs === 'number' && config.pollIntervalMs >= 0 ? config.pollIntervalMs : 10000,
			cachedInputLabels: this.normalizeCachedLabels(config.cachedInputLabels),
			cachedOutputLabels: this.normalizeCachedLabels(config.cachedOutputLabels),
		}
	}

	private normalizeCachedLabels(labels: ModuleConfig['cachedInputLabels']): Record<string, string> {
		const result: Record<string, string> = {}

		for (const [key, value] of Object.entries(labels ?? {})) {
			if (typeof value === 'string') {
				result[key] = value
			}
		}

		return result
	}

	private initConnection(): void {
		const { host, port } = this.config

		if (!host || !port) {
			void this.updateStatus(InstanceStatus.BadConfig, 'Missing host or port')
			return
		}

		void this.updateStatus(InstanceStatus.Connecting)

		this.socket = new TCPHelper(host, port)

		this.socket.on('status_change', (status, message) => {
			void this.updateStatus(status, message)
		})

		this.socket.on('error', (err) => {
			this.log('error', `Socket error: ${err.message}`)
		})

		this.socket.on('connect', () => {
			this.log('info', `Connected to ${host}:${port}`)
			void this.updateStatus(InstanceStatus.Ok)

			this.startPolling()
			this.startLabelPolling()

			setTimeout(() => {
				this.sendCommand('STA.')
			}, 500)

			setTimeout(() => {
				void this.fetchLabels()
			}, 1000)
		})

		this.socket.on('data', (data: Buffer) => {
			this.handleIncomingData(data.toString('utf8'))
		})
	}

	private startPolling(): void {
		this.stopPolling()

		if (this.config.pollIntervalMs === 0) {
			this.log('info', 'Polling disabled (interval = 0)')
			return
		}

		this.pollTimer = setInterval(() => {
			this.sendCommand('STA.')
		}, this.config.pollIntervalMs)
	}

	private stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	private startLabelPolling(): void {
		this.stopLabelPolling()

		this.labelPollTimer = setInterval(() => {
			void this.fetchLabels()
		}, 60000)
	}

	private stopLabelPolling(): void {
		if (this.labelPollTimer) {
			clearInterval(this.labelPollTimer)
			this.labelPollTimer = undefined
		}
	}

	public pollVideoStatusNow(): void {
		this.sendCommand('STA_VIDEO.')
	}

	public scheduleVideoStatusPoll(delayMs = 250): void {
		if (this.postActionVideoPollTimer) {
			clearTimeout(this.postActionVideoPollTimer)
			this.postActionVideoPollTimer = undefined
		}

		this.postActionVideoPollTimer = setTimeout(() => {
			this.postActionVideoPollTimer = undefined
			this.pollVideoStatusNow()
		}, delayMs)
	}

	public sendCommand(command: string): void {
		if (!this.socket) {
			this.log('warn', `Cannot send command while disconnected: ${command}`)
			return
		}

		this.log('debug', `TX: ${command}`)
		void this.socket.send(command)
	}

	private handleIncomingData(data: string): void {
		this.rxBuffer += data

		const lines = this.rxBuffer.split(/\r?\n/)
		this.rxBuffer = lines.pop() ?? ''

		for (const rawLine of lines) {
			const line = rawLine.trim()
			if (!line) continue

			this.log('debug', `RX: ${line}`)
			void this.parseLine(line)
		}
	}

	private checkMatrixFeedbacks(): void {
		this.checkFeedbacks('route_active', 'unit_power_on', 'output_power_on')
	}

	private parseLine(line: string): void {
		if (/^Please Input Your Command\s*:/i.test(line)) {
			return
		}

		let changed = false

		if (/^GUI Or RS232 Query Status:$/i.test(line)) {
			this.pendingStatusHeader = true
			this.pendingStatusLineIndex = 0
			return
		}

		if (this.pendingStatusHeader) {
			this.pendingStatusLineIndex++

			if (this.pendingStatusLineIndex === 1) {
				if (this.lcdReadout !== line) {
					this.lcdReadout = line
					changed = true
				}
				if (changed) this.updateAllVariableValues()
				return
			}

			if (this.pendingStatusLineIndex === 2) {
				if (this.titleBar !== line) {
					this.titleBar = line
					changed = true
				}

				this.pendingStatusHeader = false
				this.pendingStatusLineIndex = 0

				if (changed) this.updateAllVariableValues()
				return
			}

			this.pendingStatusHeader = false
			this.pendingStatusLineIndex = 0
		}

		const routeMatch = line.match(/^Output\s+(\d+)\s+Switch\s+To\s+In\s+(\d+)!$/i)
		if (routeMatch) {
			const output = Number(routeMatch[1])
			const input = Number(routeMatch[2])

			if (output >= 1 && output <= 8 && input >= 1 && input <= 8) {
				if (this.routes[output] !== input) {
					this.routes[output] = input
					changed = true
				}
			}
		}

		const guiIpMatch = line.match(/^GUI_IP:(\d{1,3}(?:\.\d{1,3}){3})!$/i)
		if (guiIpMatch) {
			if (this.guiIp !== guiIpMatch[1]) {
				this.guiIp = guiIpMatch[1]
				changed = true
				this.log('info', `GUI IP detected: ${this.guiIp}`)
			}
		}

		const unitPowerMatch = line.match(/^Power (ON|OFF)!$/i)
		if (unitPowerMatch) {
			const state = unitPowerMatch[1].toUpperCase() === 'ON'
			if (this.isOn !== state) {
				this.isOn = state
				changed = true
			}
		}

		const outputPowerMatch = line.match(/^Turn (ON|OFF) Output (\d{1,2})!$/i)
		if (outputPowerMatch) {
			const state = outputPowerMatch[1].toUpperCase() === 'ON'
			const output = Number(outputPowerMatch[2])

			if (output >= 1 && output <= 8 && this.outputPowerStates[output] !== state) {
				this.outputPowerStates[output] = state
				changed = true
			}
		}

		if (changed) {
			this.updateAllVariableValues()
			this.checkMatrixFeedbacks()
		}
	}

	public async fetchLabels(): Promise<void> {
		const postData = 'tag=ptn'

		const options: http.RequestOptions = {
			host: this.config.host,
			port: 80,
			path: '/cgi-bin/MMX32_getsetparams.cgi',
			method: 'POST',
			insecureHTTPParser: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Content-Length': Buffer.byteLength(postData),
				'X-Requested-With': 'XMLHttpRequest',
			},
		}

		this.log('debug', `Fetching labels from http://${this.config.host}/cgi-bin/MMX32_getsetparams.cgi`)

		try {
			const body = await new Promise<string>((resolve, reject) => {
				const req = http.request(options, (res) => {
					let data = ''

					this.log('debug', `Label fetch response status: ${res.statusCode} ${res.statusMessage}`)

					res.setEncoding('utf8')
					res.on('data', (chunk) => {
						data += chunk
					})
					res.on('end', () => {
						if ((res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300) {
							resolve(data)
						} else {
							reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`))
						}
					})
				})

				req.on('error', (err) => reject(err))
				req.write(postData)
				req.end()
			})

			const updated = this.parseLabelResponse(body)

			if (updated) {
				this.persistCachedLabels()
				this.log('info', 'Matrix labels updated from web interface')
				this.updateAllVariableValues()
				this.updateActions()
				this.updateFeedbacks()
				this.updatePresets()
			}
		} catch (error: unknown) {
			this.log('warn', `Label fetch error: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	private parseLabelResponse(body: string): boolean {
		let changed = false

		for (let i = 1; i <= 8; i++) {
			const inputMatch = body.match(new RegExp(`['"]Inputlable${i}['"]\\s*:\\s*['"]([^'"]*)['"]`, 'i'))
			const outputMatch = body.match(new RegExp(`['"]Outputlable${i}['"]\\s*:\\s*['"]([^'"]*)['"]`, 'i'))

			const nextInputLabel = inputMatch?.[1]?.trim() || `Input ${i}`
			const nextOutputLabel = outputMatch?.[1]?.trim() || `Output ${i}`

			if (this.inputLabels[i] !== nextInputLabel) {
				this.inputLabels[i] = nextInputLabel
				changed = true
			}

			if (this.outputLabels[i] !== nextOutputLabel) {
				this.outputLabels[i] = nextOutputLabel
				changed = true
			}
		}

		return changed
	}

	private persistCachedLabels(): void {
		this.config.cachedInputLabels = { ...this.inputLabels }
		this.config.cachedOutputLabels = { ...this.outputLabels }
		this.saveConfig(this.config)
	}

	public updateAllVariableValues(): void {
		const values: Record<string, string | number> = {}

		values['gui_ip'] = this.guiIp
		values['unit_is_on'] = this.isOn === undefined ? '' : this.isOn ? 'true' : 'false'
		values['title_bar'] = this.titleBar
		values['lcd_readout'] = this.lcdReadout

		for (let i = 1; i <= 8; i++) {
			const routedInput = this.routes[i]
			const outputIsOn = this.outputPowerStates[i]

			values[`input_${i}_label`] = this.getInputLabel(i)
			values[`output_${i}_label`] = this.getOutputLabel(i)
			values[`output_${i}_input`] = routedInput ? String(routedInput) : ''
			values[`output_${i}_input_label`] = routedInput ? this.getInputLabel(routedInput) : ''
			values[`output_${i}_is_on`] = outputIsOn === undefined ? '' : outputIsOn ? 'true' : 'false'
		}

		this.setVariableValues(values)
	}

	public getRoute(output: number): number | undefined {
		return this.routes[output]
	}

	public getInputLabel(input: number): string {
		return this.inputLabels[input] || `Input ${input}`
	}

	public getOutputLabel(output: number): string {
		return this.outputLabels[output] || `Output ${output}`
	}

	public getOutputPowerState(output: number): boolean | undefined {
		return this.outputPowerStates[output]
	}

	public setUnitPowerState(state: boolean): void {
		this.isOn = state
		this.updateAllVariableValues()
		this.checkMatrixFeedbacks()
	}

	public toggleUnitPowerState(): void {
		if (this.isOn === true) {
			this.sendCommand('PowerOFF.')
			this.setUnitPowerState(false)
		} else {
			this.sendCommand('PowerON.')
			this.setUnitPowerState(true)
		}
	}

	public setOutputPowerState(output: number, state: boolean): void {
		if (output >= 1 && output <= 8) {
			this.outputPowerStates[output] = state
			this.updateAllVariableValues()
			this.checkMatrixFeedbacks()
		}
	}
}
