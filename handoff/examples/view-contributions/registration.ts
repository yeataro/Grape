/** Only ordinary registration wiring changes when these features are added. */
import type { PanelWorkspace } from '../../executable-reference/repair/public-panel-workspace.ts';
import type { WidgetRenderer } from '../../executable-reference/repair/view-mount.ts';
import { selectionSummary } from './selection-summary.ts';
import { helpPanel } from './help-panel.ts';
import { numberWidget } from './number-widget.ts';
import { toggleWidget } from './toggle-widget.ts';
export function registerExamples(panels:PanelWorkspace,widgets:WidgetRenderer){panels.register(selectionSummary);panels.register(helpPanel);widgets.register(numberWidget);widgets.register(toggleWidget);}
