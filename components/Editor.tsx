
// Re-exporting from Editor.jsx to resolve module issues while transitioning to JS
// @ts-ignore
// Fix: Renamed import to avoid circular definition of 'Editor' within Editor.tsx
import EditorComponent from './Editor.jsx';
export default EditorComponent;
