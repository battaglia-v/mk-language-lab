# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Oops! Something went wrong" [level=1] [ref=e15]
      - paragraph [ref=e16]: We apologize for the inconvenience. An error occurred while processing your request.
    - generic [ref=e17]:
      - heading "Error Details (Development Only)" [level=2] [ref=e18]
      - generic [ref=e19]: "[next-auth]: `useSession` must be wrapped in a <SessionProvider />"
    - generic [ref=e20]:
      - button "Try Again" [ref=e21]
      - link "Go to Home" [ref=e22] [cursor=pointer]:
        - /url: /
    - paragraph [ref=e23]: If this problem persists, please contact support.
```