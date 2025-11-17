# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - generic [ref=e21]:
    - generic [ref=e22]:
      - heading "Oops! Something went wrong" [level=1] [ref=e23]
      - paragraph [ref=e24]: We apologize for the inconvenience. An error occurred while processing your request.
    - generic [ref=e25]:
      - heading "Error Details (Development Only)" [level=2] [ref=e26]
      - generic [ref=e27]: useToast must be used within ToasterProvider
    - generic [ref=e28]:
      - button "Try Again" [ref=e29]
      - link "Go to Home" [ref=e30] [cursor=pointer]:
        - /url: /
    - paragraph [ref=e31]: If this problem persists, please contact support.
  - alert [ref=e32]
```