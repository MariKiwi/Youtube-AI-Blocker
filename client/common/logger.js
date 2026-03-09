(function bootstrapLogger(global) {
  const PREFIX = "[YAIB]";

  function shouldDebug() {
    return global.__YAIB_DEBUG__ === true;
  }

  function format(args) {
    return [PREFIX, ...args];
  }

  const logger = {
    debug(...args) {
      if (shouldDebug()) {
        console.debug(...format(args));
      }
    },
    info(...args) {
      console.info(...format(args));
    },
    warn(...args) {
      console.warn(...format(args));
    },
    error(...args) {
      console.error(...format(args));
    },
  };

  global.YouTubeAiBlockerLogger = logger;
}(globalThis));

