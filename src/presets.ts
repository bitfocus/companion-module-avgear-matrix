import type { ModuleInstance } from './main.js'
import { type CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	presets['poll_status'] = {
		type: 'button',
		category: 'Utility',
		name: 'Poll System Status',
		style: {
			text: 'Poll\\nStatus',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'poll_now', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['power_on'] = {
		type: 'button',
		category: 'Power',
		name: 'Power On',
		style: {
			text: 'Power\\nOn',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'power_on', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'unit_power_on',
				options: {},
				style: {
					bgcolor: combineRgb(0, 128, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
	}

	presets['power_off'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Off',
		style: {
			text: 'Power\\nOff',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'power_off', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['power_toggle'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Toggle',
		style: {
			text: 'Power\\nToggle',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'power_toggle', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'unit_power_on',
				options: {},
				style: {
					bgcolor: combineRgb(0, 128, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
	}

	self.setPresetDefinitions(presets)
}
