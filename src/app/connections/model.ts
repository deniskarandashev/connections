interface CommonPart {
    S: string
}

export interface Companion {
    name: CommonPart,
    uid:  CommonPart
}

export interface Conversation {
    companionID: CommonPart,
    id: CommonPart
}

export interface Message {
    authorID: CommonPart,
    message: CommonPart,
    createdAt: CommonPart
}