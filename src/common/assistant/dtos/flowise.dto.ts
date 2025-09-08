

export class HistoryItem {
    type: 'sender' | 'receiver';
    content: string;
}


/**
 * ChatDto
 */
export class ChatRunResDto {
    taskId: string;
    history: HistoryItem[];
    query: string;
}
