import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables = [
		{ variableId: 'gui_ip', name: 'GUI IP Address' },
		{ variableId: 'unit_is_on', name: 'Unit Is On' },
		{ variableId: 'title_bar', name: 'Title Bar' },
		{ variableId: 'lcd_readout', name: 'LCD Readout' },
	]

	for (let i = 1; i <= 8; i++) {
		variables.push(
			{ variableId: `input_${i}_label`, name: `Input ${i} Label` },
			{ variableId: `output_${i}_label`, name: `Output ${i} Label` },
			{ variableId: `output_${i}_input`, name: `Output ${i} Current Input` },
			{ variableId: `output_${i}_input_label`, name: `Output ${i} Current Input Label` },
			{ variableId: `output_${i}_is_on`, name: `Output ${i} Is On` },
		)
	}

	self.setVariableDefinitions(variables)
}
