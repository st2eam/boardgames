type ChatOpenListener = (open: boolean) => void;

const listeners = new Set<ChatOpenListener>();
let chatOpen = false;

export function setChatOpen(open: boolean) {
  chatOpen = open;
  for (const listener of listeners) listener(open);
}

export function getChatOpen() {
  return chatOpen;
}

export function subscribeChatOpen(listener: ChatOpenListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
