1. **No Blocking Terminal Commands**: This is a web application. Do not execute hosting commands (like starting development servers) or any other commands that will block or make the terminal yourself. That will be executed by the user.


2. **Test-Driven Development (TDD)**: The development process is test-driven. Whenever the user requests a new function, feature, or code changes, analyze the request to determine if there are parts that should be covered by tests. If so, explicitly notify the user that a test should be created.


3. **Avoid over-engineering**: Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused.

- Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability. Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident. For poc designs, also don't over design and add stuff like simulated latency into the code.

- Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and
framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use feature flags or backwards-compatibility shims when you can just change the code.

- Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical
future requirements. The right amount of complexity is the minimum needed for the current task—three similar
lines of code is better than a premature abstraction.

- Avoid backwards-compatibility hacks like renaming unused _vars, re-exporting types, adding // removed
comments for removed code, etc. If you are certain that something is unused, you can delete it completely.