import type ModuleInstance from './main.js'
import { type CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	presets['poll_status'] = {
		type: 'simple',
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
		type: 'simple',
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
		type: 'simple',
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
		type: 'simple',
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

	presets['preset_recall'] = {
		type: 'simple',
		name: 'Recall Preset',
		style: {
			text: 'Recall\\nPreset 1',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'preset_recall', options: { preset: 1 } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['preset_save'] = {
		type: 'simple',
		name: 'Save Preset',
		style: {
			text: 'Save\\nPreset 1',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(128, 0, 0),
			show_topbar: false,
		},
		steps: [
			{
				down: [{ actionId: 'preset_save', options: { preset: 1 } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	self.setPresetDefinitions(
		[
			{
				id: 'power',
				name: 'Power',
				definitions: [
					{
						id: 'power',
						name: 'Power',
						type: 'simple',
						presets: ['power_on', 'power_off', 'power_toggle'],
					},
				],
			},
			{
				id: 'presets',
				name: 'Presets',
				definitions: [
					{
						id: 'presets',
						name: 'Presets',
						type: 'simple',
						presets: ['preset_recall', 'preset_save'],
					},
				],
			},
			{
				id: 'utility',
				name: 'Utility',
				definitions: [
					{
						id: 'utility',
						name: 'Utility',
						type: 'simple',
						presets: ['poll_status'],
					},
				],
			},
		],
		presets,
	)
}
