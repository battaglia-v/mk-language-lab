# Layout Components

Comprehensive layout and navigation system for the Macedonian Learning App with consistent spacing, structure, and responsive behavior.

## Table of Contents

- [Overview](#overview)
- [Components](#components)
  - [Container](#container)
  - [TopNav](#topnav)
  - [PageLayout](#pagelayout)
- [CSS Utilities](#css-utilities)
- [Usage Examples](#usage-examples)
- [Design Tokens](#design-tokens)
- [Migration Guide](#migration-guide)

## Overview

This layout system provides:

- **Consistent spacing** across all pages using a responsive scale
- **Container utilities** for content width constraints
- **Navigation components** that work seamlessly together
- **Mobile-first approach** with proper touch targets
- **Accessibility features** including skip links and ARIA labels
- **Theme support** for both light and dark modes

## Components

### Container

The `Container` component provides consistent horizontal padding and max-width constraints for page content.

#### Props

```typescript
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'content' | 'wide' | 'full';
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  center?: boolean;
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';
  className?: string;
  children: ReactNode;
}
```

#### Size Options

- `sm`: 640px - Small content
- `md`: 768px - Medium content
- `lg`: 1024px - Large content
- `xl`: 1280px - Extra large content
- `2xl`: 1536px - 2X large content
- `content`: 896px - Optimal for reading (56rem)
- `wide`: 1120px - Optimal for app content (70rem) **[Default]**
- `full`: 100% - Full width

#### Spacing Options

Responsive vertical padding that scales across breakpoints:

- `sm`: 1.5rem → 2rem → 2.5rem (mobile → tablet → desktop)
- `md`: 2rem → 3rem → 4rem
- `lg`: 3rem → 4rem → 5rem
- `xl`: 4rem → 6rem → 8rem
- `none`: No vertical padding **[Default]**

#### Example Usage

```tsx
import { Container } from '@/components/layout/Container';

// Basic content container
<Container size="content" spacing="lg">
  <h1>Page Title</h1>
  <p>Content goes here</p>
</Container>

// Wide app container
<Container size="wide" spacing="md">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card />
    <Card />
  </div>
</Container>

// Full width hero section
<Container size="full" spacing="xl">
  <HeroContent />
</Container>

// Semantic section element
<Container as="section" size="lg" spacing="lg">
  <SectionContent />
</Container>
```

### TopNav

The `TopNav` component provides a responsive navigation bar with logo, navigation links, language switcher, user menu, and search.

#### Props

```typescript
interface TopNavProps {
  sticky?: boolean;          // Stick to top of viewport (default: true)
  showMobileMenu?: boolean;  // Show hamburger menu on mobile (default: true)
  className?: string;        // Custom className
}
```

#### Features

- **Sticky positioning** with backdrop blur effect
- **Mobile hamburger menu** with smooth animations
- **Keyboard navigation** (Escape key closes mobile menu)
- **Active link highlighting** with proper ARIA attributes
- **Language switcher** for EN/MK
- **User menu** with authentication actions
- **Skip to content link** for accessibility

#### Example Usage

```tsx
import { TopNav } from '@/components/layout/TopNav';

// In your layout file
<TopNav sticky showMobileMenu />
```

**Note:** The existing `Sidebar` component continues to work alongside `TopNav`. The sidebar is visible on desktop (lg breakpoint) and collapses to a bottom navigation on mobile.

### PageLayout

The `PageLayout` component provides consistent spacing for page content, accounting for fixed headers and mobile navigation.

#### Props

```typescript
interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  withHeaderPadding?: boolean;     // Add top padding for fixed header (default: true)
  withMobileNavPadding?: boolean;  // Add bottom padding for mobile nav (default: true)
}
```

#### Example Usage

```tsx
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';

<PageLayout>
  <Container size="wide" spacing="lg">
    <h1>My Page</h1>
    <p>Content goes here</p>
  </Container>
</PageLayout>
```

## CSS Utilities

The layout system includes utility classes in `globals.css` for flexible layouts.

### Container Utilities

```css
/* Base container with responsive padding */
.section-container

/* Max-width modifiers */
.section-container-sm      /* max-width: 640px */
.section-container-md      /* max-width: 768px */
.section-container-lg      /* max-width: 1024px */
.section-container-xl      /* max-width: 1280px */
.section-container-2xl     /* max-width: 1536px */
.section-container-content /* max-width: 896px */
.section-container-wide    /* max-width: 1120px */

/* Spacing modifiers (responsive) */
.section-spacing-sm        /* 1.5rem → 2rem → 2.5rem */
.section-spacing-md        /* 2rem → 3rem → 4rem */
.section-spacing-lg        /* 3rem → 4rem → 5rem */
.section-spacing-xl        /* 4rem → 6rem → 8rem */
```

### Direct Usage

You can use these utilities directly in your JSX:

```tsx
<section className="section-container section-container-wide section-spacing-lg">
  <h2>Section Title</h2>
  <p>Content</p>
</section>
```

## Usage Examples

### Basic Page Structure

```tsx
import { Container } from '@/components/layout/Container';

export default function MyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent">
        <Container size="wide" spacing="xl">
          <h1>Welcome</h1>
          <p>Get started with our platform</p>
        </Container>
      </section>

      {/* Content Section */}
      <section>
        <Container size="content" spacing="lg">
          <article>
            <h2>Article Title</h2>
            <p>Long form content optimized for reading...</p>
          </article>
        </Container>
      </section>

      {/* Full Width Section */}
      <section className="bg-card">
        <Container size="xl" spacing="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card />
            <Card />
            <Card />
          </div>
        </Container>
      </section>
    </div>
  );
}
```

### Layout with Navigation

```tsx
// app/[locale]/layout.tsx
import { TopNav } from '@/components/layout/TopNav';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

export default function Layout({ children }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Top Navigation */}
      <TopNav sticky />

      {/* Main Content with proper spacing */}
      <div className="lg:ml-sidebar flex flex-col min-h-screen">
        <main className="pt-14 lg:pt-16 flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
```

### Responsive Grid

```tsx
import { Container } from '@/components/layout/Container';

<Container size="wide" spacing="lg">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {items.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
</Container>
```

### Nested Containers

```tsx
<Container size="full" spacing="none">
  <div className="bg-gradient-to-r from-primary to-secondary">
    <Container size="wide" spacing="lg">
      <h1>Nested Content</h1>
    </Container>
  </div>
</Container>
```

## Design Tokens

The layout system uses design tokens from `@mk/tokens`:

### Spacing Scale

```typescript
{
  xs: 4px,
  sm: 8px,
  md: 12px,
  lg: 16px,
  xl: 24px,
  '2xl': 32px,
  '3xl': 40px
}
```

### Breakpoints

```typescript
{
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

### Container Max-Widths

- **Content-focused**: 896px (56rem) - Optimal line length for reading
- **App-focused**: 1120px (70rem) - Balance between content and space utilization
- **Wide layouts**: Up to 1536px (96rem) for dashboard-style layouts

## Migration Guide

### Updating Existing Pages

**Before:**
```tsx
<div className="container mx-auto px-4 py-6">
  <h1>Page Title</h1>
</div>
```

**After:**
```tsx
import { Container } from '@/components/layout/Container';

<Container size="wide" spacing="md">
  <h1>Page Title</h1>
</Container>
```

### Replacing Manual Padding

**Before:**
```tsx
<section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
  <Content />
</section>
```

**After:**
```tsx
<Container size="lg" spacing="md">
  <Content />
</Container>
```

### Homepage Example

The homepage has been updated to use the new Container system. See `/app/[locale]/page.tsx` for a complete example.

**Before:**
```tsx
<section className="w-full">
  <div className="mx-auto max-w-6xl px-4 py-12">
    <Content />
  </div>
</section>
```

**After:**
```tsx
<section className="w-full">
  <Container size="xl" spacing="lg">
    <Content />
  </Container>
</section>
```

## Best Practices

1. **Use semantic HTML**: Leverage the `as` prop to use appropriate semantic elements
2. **Mobile-first**: Design for mobile viewports first, then scale up
3. **Consistent spacing**: Use the provided spacing scale rather than custom values
4. **Container sizing**: Choose `content` for text-heavy pages, `wide` for app interfaces
5. **Accessibility**: Ensure proper heading hierarchy and ARIA labels
6. **Performance**: Use proper image optimization and lazy loading

## Testing Recommendations

1. **Responsive Testing**
   - Test on mobile (320px - 640px)
   - Test on tablet (640px - 1024px)
   - Test on desktop (1024px+)
   - Test on ultra-wide screens (1920px+)

2. **Accessibility Testing**
   - Keyboard navigation (Tab, Shift+Tab, Escape)
   - Screen reader compatibility
   - Color contrast ratios
   - Touch target sizes (minimum 48px)

3. **Visual Regression Testing**
   - Compare screenshots across breakpoints
   - Test light and dark themes
   - Verify consistent spacing

4. **Cross-browser Testing**
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (iOS and macOS)

## Support

For issues or questions about the layout system:
- Check this documentation
- Review the component source code
- Test in different viewports
- Consult the design tokens package (`@mk/tokens`)

---

**Last Updated**: 2025-11-13
**Version**: 1.0.0
