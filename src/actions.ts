import type { CompanionActionDefinitions } from '@companion-module/base'
import { buildInputChoices, buildOutputChoices } from './choices.js'
import type ModuleInstance from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	const inputChoices = buildInputChoices(self)
	const outputChoices = buildOutputChoices(self)

	const actions: CompanionActionDefinitions = {
		route: {
			name: 'Route Input to Output',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: 1,
					choices: inputChoices,
				},
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: 1,
					choices: outputChoices,
				},
			],
			callback: (event) => {
				const input = Number(event.options.input)
				const output = Number(event.options.output)

				if (!Number.isInteger(output) || !Number.isInteger(input)) return

				self.sendCommand(`OUT${String(output).padStart(2, '0')}:${String(input).padStart(2, '0')}.`)
				self.scheduleVideoStatusPoll()
			},
		},

		route_all: {
			name: 'Route Input to All Outputs',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: 1,
					choices: inputChoices,
				},
			],
			callback: (event) => {
				const input = Number(event.options.input)

				if (!Number.isInteger(input)) return

				self.sendCommand(`OUT00:${String(input).padStart(2, '0')}.`)
				self.scheduleVideoStatusPoll()
			},
		},

		preset_recall: {
			name: 'Recall Preset',
			options: [
				{
					id: 'preset',
					type: 'number',
					label: 'Preset',
					default: 1,
					min: 1,
					max: 9,
				},
			],
			callback: (event) => {
				const preset = Number(event.options.preset)

				if (!Number.isInteger(preset) || preset < 1 || preset > 9) return

				self.sendCommand(`PresetRecall${String(preset).padStart(2, '0')}.`)
				self.scheduleVideoStatusPoll()
			},
		},

		preset_save: {
			name: 'Save Preset',
			options: [
				{
					id: 'preset',
					type: 'number',
					label: 'Preset',
					default: 1,
					min: 1,
					max: 9,
				},
			],
			callback: (event) => {
				const preset = Number(event.options.preset)

				if (!Number.isInteger(preset) || preset < 1 || preset > 9) return

				self.sendCommand(`PresetSave${String(preset).padStart(2, '0')}.`)
				self.scheduleVideoStatusPoll()
			},
		},

		power_on: {
			name: 'Power On Unit',
			options: [],
			callback: () => {
				self.sendCommand('PowerON.')
				self.setUnitPowerState(true)
			},
		},

		power_off: {
			name: 'Power Off Unit',
			options: [],
			callback: () => {
				self.sendCommand('PowerOFF.')
				self.setUnitPowerState(false)
			},
		},

		power_toggle: {
			name: 'Toggle Unit Power',
			options: [],
			callback: () => {
				self.toggleUnitPowerState()
			},
		},

		output_on: {
			name: 'Turn Output On',
			options: [
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: 1,
					choices: outputChoices,
				},
			],
			callback: (event) => {
				const output = Number(event.options.output)
				if (!Number.isInteger(output)) return

				self.sendCommand(`@OUT${String(output).padStart(2, '0')}.`)
				self.setOutputPowerState(output, true)
				self.scheduleVideoStatusPoll()
			},
		},

		output_off: {
			name: 'Turn Output Off',
			options: [
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: 1,
					choices: outputChoices,
				},
			],
			callback: (event) => {
				const output = Number(event.options.output)
				if (!Number.isInteger(output)) return

				self.sendCommand(`$OUT${String(output).padStart(2, '0')}.`)
				self.setOutputPowerState(output, false)
				self.scheduleVideoStatusPoll()
			},
		},

		poll_now: {
			name: 'Poll System Status',
			options: [],
			callback: () => {
				self.sendCommand('STA.')
			},
		},

		poll_gui_ip: {
			name: 'Poll GUI IP',
			options: [],
			callback: () => {
				self.sendCommand('GetGuiIP.')
			},
		},

		refresh_labels: {
			name: 'Refresh Labels from Matrix',
			options: [],
			callback: async () => {
				await self.fetchLabels()
			},
		},
	}

	self.setActionDefinitions(actions)
}
