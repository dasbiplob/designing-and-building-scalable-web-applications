import { InvalidStateError } from "./errors.ts";
import { readArrayReply } from "./protocol/mod.ts";
import { decoder } from "./protocol/_util.ts";
class RedisSubscriptionImpl {
  executor;
  get isConnected() {
    return this.executor.connection.isConnected;
  }
  get isClosed() {
    return this.executor.connection.isClosed;
  }
  channels;
  patterns;
  constructor(executor){
    this.executor = executor;
    this.channels = Object.create(null);
    this.patterns = Object.create(null);
  }
  async psubscribe(...patterns) {
    await this.executor.exec("PSUBSCRIBE", ...patterns);
    for (const pat of patterns){
      this.patterns[pat] = true;
    }
  }
  async punsubscribe(...patterns) {
    await this.executor.exec("PUNSUBSCRIBE", ...patterns);
    for (const pat of patterns){
      delete this.patterns[pat];
    }
  }
  async subscribe(...channels) {
    await this.executor.exec("SUBSCRIBE", ...channels);
    for (const chan of channels){
      this.channels[chan] = true;
    }
  }
  async unsubscribe(...channels) {
    await this.executor.exec("UNSUBSCRIBE", ...channels);
    for (const chan of channels){
      delete this.channels[chan];
    }
  }
  receive() {
    return this.#receive(false);
  }
  receiveBuffers() {
    return this.#receive(true);
  }
  async *#receive(binaryMode) {
    let forceReconnect = false;
    const connection = this.executor.connection;
    while(this.isConnected){
      try {
        let rep;
        try {
          // TODO: `readArrayReply` should not be called directly here
          rep = await readArrayReply(connection.reader, binaryMode);
        } catch (err) {
          if (err instanceof Deno.errors.BadResource) {
            // Connection already closed.
            connection.close();
            break;
          }
          throw err;
        }
        const event = rep[0] instanceof Uint8Array ? decoder.decode(rep[0]) : rep[0];
        if (event === "message" && rep.length === 3) {
          const channel = rep[1] instanceof Uint8Array ? decoder.decode(rep[1]) : rep[1];
          const message = rep[2];
          yield {
            channel,
            message
          };
        } else if (event === "pmessage" && rep.length === 4) {
          const pattern = rep[1] instanceof Uint8Array ? decoder.decode(rep[1]) : rep[1];
          const channel = rep[2] instanceof Uint8Array ? decoder.decode(rep[2]) : rep[2];
          const message = rep[3];
          yield {
            pattern,
            channel,
            message
          };
        }
      } catch (error) {
        if (error instanceof InvalidStateError || error instanceof Deno.errors.BadResource) {
          forceReconnect = true;
        } else throw error;
      } finally{
        if (!this.isClosed && !this.isConnected || forceReconnect) {
          await connection.reconnect();
          forceReconnect = false;
          if (Object.keys(this.channels).length > 0) {
            await this.subscribe(...Object.keys(this.channels));
          }
          if (Object.keys(this.patterns).length > 0) {
            await this.psubscribe(...Object.keys(this.patterns));
          }
        }
      }
    }
  }
  close() {
    this.executor.connection.close();
  }
}
export async function subscribe(executor, ...channels) {
  const sub = new RedisSubscriptionImpl(executor);
  await sub.subscribe(...channels);
  return sub;
}
export async function psubscribe(executor, ...patterns) {
  const sub = new RedisSubscriptionImpl(executor);
  await sub.psubscribe(...patterns);
  return sub;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9wdWJzdWIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb21tYW5kRXhlY3V0b3IgfSBmcm9tIFwiLi9leGVjdXRvci50c1wiO1xuaW1wb3J0IHsgSW52YWxpZFN0YXRlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnMudHNcIjtcbmltcG9ydCB0eXBlIHsgQmluYXJ5IH0gZnJvbSBcIi4vcHJvdG9jb2wvbW9kLnRzXCI7XG5pbXBvcnQgeyByZWFkQXJyYXlSZXBseSB9IGZyb20gXCIuL3Byb3RvY29sL21vZC50c1wiO1xuaW1wb3J0IHsgZGVjb2RlciB9IGZyb20gXCIuL3Byb3RvY29sL191dGlsLnRzXCI7XG5cbnR5cGUgRGVmYXVsdE1lc3NhZ2VUeXBlID0gc3RyaW5nO1xudHlwZSBWYWxpZE1lc3NhZ2VUeXBlID0gc3RyaW5nIHwgc3RyaW5nW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkaXNTdWJzY3JpcHRpb248XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4ge1xuICByZWFkb25seSBpc0Nsb3NlZDogYm9vbGVhbjtcbiAgcmVjZWl2ZSgpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8UmVkaXNQdWJTdWJNZXNzYWdlPFRNZXNzYWdlPj47XG4gIHJlY2VpdmVCdWZmZXJzKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSZWRpc1B1YlN1Yk1lc3NhZ2U8QmluYXJ5Pj47XG4gIHBzdWJzY3JpYmUoLi4ucGF0dGVybnM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPjtcbiAgc3Vic2NyaWJlKC4uLmNoYW5uZWxzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD47XG4gIHB1bnN1YnNjcmliZSguLi5wYXR0ZXJuczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+O1xuICB1bnN1YnNjcmliZSguLi5jaGFubmVsczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+O1xuICBjbG9zZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzUHViU3ViTWVzc2FnZTxUTWVzc2FnZSA9IERlZmF1bHRNZXNzYWdlVHlwZT4ge1xuICBwYXR0ZXJuPzogc3RyaW5nO1xuICBjaGFubmVsOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IFRNZXNzYWdlO1xufVxuXG5jbGFzcyBSZWRpc1N1YnNjcmlwdGlvbkltcGw8XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4gaW1wbGVtZW50cyBSZWRpc1N1YnNjcmlwdGlvbjxUTWVzc2FnZT4ge1xuICBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGdldCBpc0Nsb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRvci5jb25uZWN0aW9uLmlzQ2xvc2VkO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGFubmVscyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHByaXZhdGUgcGF0dGVybnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXhlY3V0b3I6IENvbW1hbmRFeGVjdXRvcikge31cblxuICBhc3luYyBwc3Vic2NyaWJlKC4uLnBhdHRlcm5zOiBzdHJpbmdbXSkge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhcIlBTVUJTQ1JJQkVcIiwgLi4ucGF0dGVybnMpO1xuICAgIGZvciAoY29uc3QgcGF0IG9mIHBhdHRlcm5zKSB7XG4gICAgICB0aGlzLnBhdHRlcm5zW3BhdF0gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHB1bnN1YnNjcmliZSguLi5wYXR0ZXJuczogc3RyaW5nW10pIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoXCJQVU5TVUJTQ1JJQkVcIiwgLi4ucGF0dGVybnMpO1xuICAgIGZvciAoY29uc3QgcGF0IG9mIHBhdHRlcm5zKSB7XG4gICAgICBkZWxldGUgdGhpcy5wYXR0ZXJuc1twYXRdO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZSguLi5jaGFubmVsczogc3RyaW5nW10pIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoXCJTVUJTQ1JJQkVcIiwgLi4uY2hhbm5lbHMpO1xuICAgIGZvciAoY29uc3QgY2hhbiBvZiBjaGFubmVscykge1xuICAgICAgdGhpcy5jaGFubmVsc1tjaGFuXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdW5zdWJzY3JpYmUoLi4uY2hhbm5lbHM6IHN0cmluZ1tdKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKFwiVU5TVUJTQ1JJQkVcIiwgLi4uY2hhbm5lbHMpO1xuICAgIGZvciAoY29uc3QgY2hhbiBvZiBjaGFubmVscykge1xuICAgICAgZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbl07XG4gICAgfVxuICB9XG5cbiAgcmVjZWl2ZSgpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8UmVkaXNQdWJTdWJNZXNzYWdlPFRNZXNzYWdlPj4ge1xuICAgIHJldHVybiB0aGlzLiNyZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHJlY2VpdmVCdWZmZXJzKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSZWRpc1B1YlN1Yk1lc3NhZ2U8QmluYXJ5Pj4ge1xuICAgIHJldHVybiB0aGlzLiNyZWNlaXZlKHRydWUpO1xuICB9XG5cbiAgYXN5bmMgKiNyZWNlaXZlPFxuICAgIFQgPSBUTWVzc2FnZSxcbiAgPihcbiAgICBiaW5hcnlNb2RlOiBib29sZWFuLFxuICApOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8XG4gICAgUmVkaXNQdWJTdWJNZXNzYWdlPFQ+XG4gID4ge1xuICAgIGxldCBmb3JjZVJlY29ubmVjdCA9IGZhbHNlO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLmV4ZWN1dG9yLmNvbm5lY3Rpb247XG4gICAgd2hpbGUgKHRoaXMuaXNDb25uZWN0ZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCByZXA6IFtzdHJpbmcgfCBCaW5hcnksIHN0cmluZyB8IEJpbmFyeSwgVF0gfCBbXG4gICAgICAgICAgc3RyaW5nIHwgQmluYXJ5LFxuICAgICAgICAgIHN0cmluZyB8IEJpbmFyeSxcbiAgICAgICAgICBzdHJpbmcgfCBCaW5hcnksXG4gICAgICAgICAgVCxcbiAgICAgICAgXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUT0RPOiBgcmVhZEFycmF5UmVwbHlgIHNob3VsZCBub3QgYmUgY2FsbGVkIGRpcmVjdGx5IGhlcmVcbiAgICAgICAgICByZXAgPSAoYXdhaXQgcmVhZEFycmF5UmVwbHkoXG4gICAgICAgICAgICBjb25uZWN0aW9uLnJlYWRlcixcbiAgICAgICAgICAgIGJpbmFyeU1vZGUsXG4gICAgICAgICAgKSkgYXMgdHlwZW9mIHJlcDtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlKSB7XG4gICAgICAgICAgICAvLyBDb25uZWN0aW9uIGFscmVhZHkgY2xvc2VkLlxuICAgICAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gcmVwWzBdIGluc3RhbmNlb2YgVWludDhBcnJheVxuICAgICAgICAgID8gZGVjb2Rlci5kZWNvZGUocmVwWzBdKVxuICAgICAgICAgIDogcmVwWzBdO1xuXG4gICAgICAgIGlmIChldmVudCA9PT0gXCJtZXNzYWdlXCIgJiYgcmVwLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgIGNvbnN0IGNoYW5uZWwgPSByZXBbMV0gaW5zdGFuY2VvZiBVaW50OEFycmF5XG4gICAgICAgICAgICA/IGRlY29kZXIuZGVjb2RlKHJlcFsxXSlcbiAgICAgICAgICAgIDogcmVwWzFdO1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZXBbMl07XG4gICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgY2hhbm5lbCxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudCA9PT0gXCJwbWVzc2FnZVwiICYmIHJlcC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gcmVwWzFdIGluc3RhbmNlb2YgVWludDhBcnJheVxuICAgICAgICAgICAgPyBkZWNvZGVyLmRlY29kZShyZXBbMV0pXG4gICAgICAgICAgICA6IHJlcFsxXTtcbiAgICAgICAgICBjb25zdCBjaGFubmVsID0gcmVwWzJdIGluc3RhbmNlb2YgVWludDhBcnJheVxuICAgICAgICAgICAgPyBkZWNvZGVyLmRlY29kZShyZXBbMl0pXG4gICAgICAgICAgICA6IHJlcFsyXTtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gcmVwWzNdO1xuICAgICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICBjaGFubmVsLFxuICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkU3RhdGVFcnJvciB8fFxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQmFkUmVzb3VyY2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgZm9yY2VSZWNvbm5lY3QgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgdGhyb3cgZXJyb3I7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoKCF0aGlzLmlzQ2xvc2VkICYmICF0aGlzLmlzQ29ubmVjdGVkKSB8fCBmb3JjZVJlY29ubmVjdCkge1xuICAgICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucmVjb25uZWN0KCk7XG4gICAgICAgICAgZm9yY2VSZWNvbm5lY3QgPSBmYWxzZTtcblxuICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmNoYW5uZWxzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnN1YnNjcmliZSguLi5PYmplY3Qua2V5cyh0aGlzLmNoYW5uZWxzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnBhdHRlcm5zKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBzdWJzY3JpYmUoLi4uT2JqZWN0LmtleXModGhpcy5wYXR0ZXJucykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWJzY3JpYmU8XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4oXG4gIGV4ZWN1dG9yOiBDb21tYW5kRXhlY3V0b3IsXG4gIC4uLmNoYW5uZWxzOiBzdHJpbmdbXVxuKTogUHJvbWlzZTxSZWRpc1N1YnNjcmlwdGlvbjxUTWVzc2FnZT4+IHtcbiAgY29uc3Qgc3ViID0gbmV3IFJlZGlzU3Vic2NyaXB0aW9uSW1wbDxUTWVzc2FnZT4oZXhlY3V0b3IpO1xuICBhd2FpdCBzdWIuc3Vic2NyaWJlKC4uLmNoYW5uZWxzKTtcbiAgcmV0dXJuIHN1Yjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBzdWJzY3JpYmU8XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4oXG4gIGV4ZWN1dG9yOiBDb21tYW5kRXhlY3V0b3IsXG4gIC4uLnBhdHRlcm5zOiBzdHJpbmdbXVxuKTogUHJvbWlzZTxSZWRpc1N1YnNjcmlwdGlvbjxUTWVzc2FnZT4+IHtcbiAgY29uc3Qgc3ViID0gbmV3IFJlZGlzU3Vic2NyaXB0aW9uSW1wbDxUTWVzc2FnZT4oZXhlY3V0b3IpO1xuICBhd2FpdCBzdWIucHN1YnNjcmliZSguLi5wYXR0ZXJucyk7XG4gIHJldHVybiBzdWI7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxpQkFBaUIsUUFBUSxjQUFjO0FBRWhELFNBQVMsY0FBYyxRQUFRLG9CQUFvQjtBQUNuRCxTQUFTLE9BQU8sUUFBUSxzQkFBc0I7QUF3QjlDLE1BQU07RUFjZ0I7RUFYcEIsSUFBSSxjQUF1QjtJQUN6QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVc7RUFDN0M7RUFFQSxJQUFJLFdBQW9CO0lBQ3RCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUTtFQUMxQztFQUVRLFNBQStCO0VBQy9CLFNBQStCO0VBRXZDLFlBQW9CLFNBQTJCO29CQUEzQjtTQUhaLFdBQVcsT0FBTyxNQUFNLENBQUM7U0FDekIsV0FBVyxPQUFPLE1BQU0sQ0FBQztFQUVlO0VBRWhELE1BQU0sV0FBVyxHQUFHLFFBQWtCLEVBQUU7SUFDdEMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7SUFDMUMsS0FBSyxNQUFNLE9BQU8sU0FBVTtNQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRztJQUN2QjtFQUNGO0VBRUEsTUFBTSxhQUFhLEdBQUcsUUFBa0IsRUFBRTtJQUN4QyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQjtJQUM1QyxLQUFLLE1BQU0sT0FBTyxTQUFVO01BQzFCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO0lBQzNCO0VBQ0Y7RUFFQSxNQUFNLFVBQVUsR0FB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