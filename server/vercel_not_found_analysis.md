# Vercel `NOT_FOUND` Deep Dive

This report analyzes the `404: NOT_FOUND` error encountered during the deployment of the AI Personal Finance Advisor on Vercel.

## 1. The Fix
To resolve the error, the `vercel.json` was updated to explicitly include both the **static build** (Vite frontend) and the **backend function** (Express).

```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" }, 
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## 2. Root Cause Analysis
The `NOT_FOUND` error occurred because Vercel was searching for files that **simply didn't exist** on the edge network.

*   **Code Action vs. Need**: The initial `vercel.json` only had `server.js` in the `builds` list. It needed to have both `server.js` and `package.json` (as a static build) to trigger the Vite compilation.
*   **Trigger**: In Vercel, if you define a `builds` array, you **override Zero Config**. Vercel stops "guessing" and follows your instructions to the letter. Since the static build was missing from our list, Vercel never ran `npm run build`.
*   **Oversight**: The misconception was that Vercel's default Vite detection would still run alongside our custom `server.js` node build. In reality, it's an "all or nothing" configuration.

## 3. The Underlying Principle
### Why This Error Exists
`NOT_FOUND` on Vercel isn't just a standard 404; it's a signal from Vercel's edge network that **the routing engine reached the end of its rules** and couldn't find a file or function to handle the request.

### Mental Model: The Pipeline
Think of Vercel as a **factory assembly line**. 
1.  **Zero Config**: Vercel looks at your tools (Vite, Next.js, etc.) and sets up the line for you.
2.  **Explicit Config (`vercel.json`)**: You are manually designing the assembly line. If you forget the "Frontend Station," the product reaches the end of the line empty, and the customer (the browser) gets a 404.

## 4. Warning Signs and Future Recognition
*   **Build Time**: A build time of **under 1 minute** for a React/Vite project is a huge red flag. A real build usually takes 45–90 seconds. 
*   **"Build Completed in 31ms"**: This log message is proof that Vercel didn't actually *do* anything during the build step.
*   **Similar Scenarios**: You'll see this again if you deploy a monorepo and forget to set the "Root Directory," or if your build script outputs to a different folder (e.g., `build/` instead of `dist/`) than what Vercel expects.

## 5. Alternatives and Trade-offs
| Approach | Pros | Cons |
| :--- | :--- | :--- |
| **Monolith (Render)** | Simple to manage, stays in one place, better for long-running tasks. | Slightly higher cold-start time, costs money for 24/7 uptime. |
| **Decoupled (Vercel)** | Extremely fast global scale, free for hobby use, independent scaling. | More complex routing, "serverless" functions have 10-second timeouts. |

**The Decision**: For this project, a **Decoupled Vercel architecture** was chosen because it provides the best performance for your React frontend, even though it requires careful configuration of the Express "Serverless" bridge.
