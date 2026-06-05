import type ModuleInstance from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables: Record<string, { name: string }> = {
		gui_ip: { name: 'GUI IP Address' },
		unit_is_on: { name: 'Unit Is On' },
		title_bar: { name: 'Title Bar' },
		lcd_readout: { name: 'LCD Readout' },
	}

	for (let i = 1; i <= 8; i++) {
		variables[`input_${i}_label`] = { name: `Input ${i} Label` }
		variables[`output_${i}_label`] = { name: `Output ${i} Label` }
		variables[`output_${i}_input`] = { name: `Output ${i} Current Input` }
		variables[`output_${i}_input_label`] = { name: `Output ${i} Current Input Label` }
		variables[`output_${i}_is_on`] = { name: `Output ${i} Is On` }
	}

	self.setVariableDefinitions(variables)
}
