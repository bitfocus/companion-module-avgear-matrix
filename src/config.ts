import { Regex, type JsonObject, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = JsonObject & {
	host: string
	port: number
	pollIntervalMs: number
	cachedInputLabels?: JsonObject
	cachedOutputLabels?: JsonObject
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Matrix IP Address',
			width: 8,
			regex: Regex.IP,
			useVariables: true,
			default: '192.168.0.178',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Matrix TCP Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 4001,
		},
		{
			type: 'number',
			id: 'pollIntervalMs',
			label: 'Polling rate (ms) (0 = disabled)',
			width: 4,
			min: 0,
			max: 60000,
			default: 10000,
		},
	]
}
