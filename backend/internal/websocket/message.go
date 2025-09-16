package websocket

type MessageType string

const (
	MessageTypeMessage  MessageType = "message"
	MessageTypeSystem   MessageType = "system"
	MessageTypeUserList MessageType = "userlist"
)

type Message struct {
	Type      MessageType `json:"type"`
	Username  string      `json:"username,omitempty"`
	Content   string      `json:"content,omitempty"`
	Users     []string    `json:"users,omitempty"`
	Timestamp int64       `json:"timestamp,omitempty"`
}
