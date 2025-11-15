# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "2"
          - generic [ref=e15]: "3"
        - generic [ref=e16]:
          - text: Issue
          - generic [ref=e17]: s
      - button "Collapse issues badge" [ref=e18]:
        - img [ref=e19]
  - generic [ref=e22]:
    - generic [ref=e23]:
      - heading "Oops! Something went wrong" [level=1] [ref=e24]
      - paragraph [ref=e25]: We apologize for the inconvenience. An error occurred while processing your request.
    - generic [ref=e26]:
      - heading "Error Details (Development Only)" [level=2] [ref=e27]
      - generic [ref=e28]: No QueryClient set, use QueryClientProvider to set one
    - generic [ref=e29]:
      - button "Try Again" [ref=e30]
      - link "Go to Home" [ref=e31] [cursor=pointer]:
        - /url: /
    - paragraph [ref=e32]: If this problem persists, please contact support.
  - alert [ref=e33]
```