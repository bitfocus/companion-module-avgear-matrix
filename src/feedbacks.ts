import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const inputChoices = Array.from({ length: 8 }, (_, i) => {
		const input = i + 1
		const label = self.getInputLabel(input)
		return {
			id: input,
			label: label && label !== `Input ${input}` ? `Input ${input} - ${label}` : `Input ${input}`,
		}
	})

	const outputChoices = Array.from({ length: 8 }, (_, i) => {
		const output = i + 1
		const label = self.getOutputLabel(output)
		return {
			id: output,
			label: label && label !== `Output ${output}` ? `Output ${output} - ${label}` : `Output ${output}`,
		}
	})

	const feedbacks: CompanionFeedbackDefinitions = {
		route_active: {
			name: 'Route Active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 0),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => {
				const input = Number(feedback.options.input)
				const output = Number(feedback.options.output)

				return self.getRoute(output) === input
			},
		},

		unit_power_on: {
			name: 'Unit Power On',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.isOn === true
			},
		},

		output_power_on: {
			name: 'Output Power On',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: 1,
					choices: outputChoices,
				},
			],
			callback: (feedback) => {
				const output = Number(feedback.options.output)
				return self.getOutputPowerState(output) === true
			},
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
