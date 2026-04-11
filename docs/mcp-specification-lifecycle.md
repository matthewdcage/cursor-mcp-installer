# MCP Specification: Lifecycle

> Source: https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle

## Connection Lifecycle

1. **Initialization** - Capability negotiation and protocol version agreement
2. **Operation** - Normal protocol communication
3. **Shutdown** - Graceful termination

## Initialization Phase

### Client sends `initialize` request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {},
      "elicitation": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    }
  }
}
```

### Server responds:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "logging": {},
      "prompts": { "listChanged": true },
      "resources": { "subscribe": true, "listChanged": true },
      "tools": { "listChanged": true }
    },
    "serverInfo": {
      "name": "ExampleServer",
      "version": "1.0.0"
    },
    "instructions": "Optional instructions"
  }
}
```

### Client sends `initialized` notification:

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

## Version Negotiation

- Client sends latest supported version
- Server responds with same version if supported, otherwise its latest
- Client disconnects if it doesn't support the server's version
- HTTP clients MUST include `MCP-Protocol-Version` header on subsequent requests

## Capability Negotiation

| Category | Capability | Description |
|----------|-----------|-------------|
| Client | `roots` | Filesystem roots |
| Client | `sampling` | LLM sampling requests |
| Client | `elicitation` | User input requests |
| Server | `prompts` | Prompt templates |
| Server | `resources` | Readable resources |
| Server | `tools` | Callable tools |
| Server | `logging` | Structured log messages |
| Server | `completions` | Argument autocompletion |

## Shutdown

### stdio
1. Close input stream to child process
2. Wait for exit, then SIGTERM
3. SIGKILL if still running

### HTTP
Close associated HTTP connections.

## Ping (Liveness)

Send `ping` method for keep-alive checks. Both client and server can send pings.

## Error Handling

- Protocol version mismatch: error code -32602
- Timeout: send cancellation notification, stop waiting
- Missing capabilities: -32602 (Invalid params)
