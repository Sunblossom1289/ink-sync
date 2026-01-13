
// Re-exporting from App.jsx to resolve module issues while transitioning to JS
// @ts-ignore
// Fix: Renamed import to avoid circular definition of 'App' within App.tsx
import AppComponent from './App.jsx';
export default AppComponent;
