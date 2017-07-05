import context from 'context-utils';

export default function getContextOptions(viewName) {
	if (context && context.uikit && context.uikit[viewName])
		return context.uikit[viewName];
	return {};
}
