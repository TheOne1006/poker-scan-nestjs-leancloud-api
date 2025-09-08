




export class DifyChatResDto {
    "event": string;
    "task_id": string;
    "id": string;
    "message_id": string;
    "conversation_id": string;
    "mode": string;
    "answer": string;
    "metadata": {
        "usage": {
            "prompt_tokens": number;
            "prompt_unit_price": string;
            "prompt_price_unit": string;
            "prompt_price": string;
            "completion_tokens": number;
            "completion_unit_price": string;
            "completion_price_unit": string;
            "completion_price": string;
            "total_tokens": number;
            "total_price": string;
            "currency": string;
            "latency": number;
        };
        "retriever_resources": {
            "position": number;
            "dataset_id": string;
            "dataset_name": string;
            "document_id": string;
            "document_name": string;
            "segment_id": string;
            "score": number;
            "content": string;
        }[];
    };
    "created_at": number;
}
