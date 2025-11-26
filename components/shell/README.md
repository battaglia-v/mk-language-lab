# Shell components

The shell packages the primary navigation surfaces shared across app pages:

- **ShellHeader**: brand, locale switcher, and contextual quick links.
- **SidebarNav**: primary navigation list for desktop and large-screen layouts.
- **MobileTabNav**: fixed tab bar for mobile users.

## Interaction model

- On mobile, the tab bar is the primary way to navigate between product areas. Header quick links (e.g., back-to-section buttons and profile shortcuts) are hidden on small screens to reduce duplicate paths.
- The sidebar remains accessible via the header menu toggle on mobile and is permanently visible on larger screens.
- Dashboard action cards surface a couple of essential quick links for mobile users while keeping the fuller set visible on desktop.
- Keyboard shortcuts and auxiliary calls-to-action stay desktop-only to keep the mobile chrome minimal.

Keep these constraints in mind when adding new shell affordances so the mobile surface remains focused.
