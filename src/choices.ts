import type ModuleInstance from './main.js'

const MATRIX_SIZE = 8

function buildNumberedChoices(
	prefix: string,
	getLabel: (id: number) => string | undefined,
): { id: number; label: string }[] {
	return Array.from({ length: MATRIX_SIZE }, (_, i) => {
		const id = i + 1
		const defaultLabel = `${prefix} ${id}`
		const label = getLabel(id)

		return {
			id,
			label: label && label !== defaultLabel ? `${defaultLabel} - ${label}` : defaultLabel,
		}
	})
}

export function buildInputChoices(self: ModuleInstance): { id: number; label: string }[] {
	return buildNumberedChoices('Input', (input) => self.getInputLabel(input))
}

export function buildOutputChoices(self: ModuleInstance): { id: number; label: string }[] {
	return buildNumberedChoices('Output', (output) => self.getOutputLabel(output))
}
