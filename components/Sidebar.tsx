
// Re-exporting from Sidebar.jsx to resolve module issues while transitioning to JS
// @ts-ignore
// Fix: Renamed import to avoid circular definition of 'Sidebar' within Sidebar.tsx
import SidebarComponent from './Sidebar.jsx';
export default SidebarComponent;
