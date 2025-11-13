const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const MAX_MESSAGES_PER_REQUEST = 100;

export type ExpoPushMessage = {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  ttl?: number;
  priority?: 'default' | 'normal' | 'high';
};

export type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
    [key: string]: unknown;
  };
};

type ExpoPushResponse = {
  data: ExpoPushTicket[];
};

export type ExpoPushTicketRecord = {
  message: ExpoPushMessage;
  ticket: ExpoPushTicket;
};

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicketRecord[]> {
  if (messages.length === 0) {
    return [];
  }

  const chunks = chunk(messages, MAX_MESSAGES_PER_REQUEST);
  const records: ExpoPushTicketRecord[] = [];

  for (const chunkMessages of chunks) {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(chunkMessages),
    });

    let payload: ExpoPushResponse | null = null;
    try {
      payload = (await response.json()) as ExpoPushResponse;
    } catch (error) {
      console.error('[expo-push] Failed to parse response', error);
    }

    const tickets = alignTicketsWithMessages(chunkMessages, payload);
    records.push(...tickets);

    if (!response.ok) {
      console.error('[expo-push] Request failed', {
        status: response.status,
        statusText: response.statusText,
        tickets,
      });
      continue;
    }

    const errored = tickets.filter((record) => record.ticket.status === 'error');
    if (errored.length > 0) {
      console.warn('[expo-push] Ticket errors', errored);
    }
  }

  return records;
}

function alignTicketsWithMessages(messages: ExpoPushMessage[], payload: ExpoPushResponse | null): ExpoPushTicketRecord[] {
  if (!payload || !Array.isArray(payload.data)) {
    return messages.map((message) => ({
      message,
      ticket: {
        status: 'error',
        message: 'Malformed Expo push response',
      },
    }));
  }

  return messages.map((message, index) => {
    const ticket = payload?.data?.[index] ?? {
      status: 'error',
      message: 'Missing Expo push ticket',
    };

    return {
      message,
      ticket,
    };
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) {
    return [items];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
