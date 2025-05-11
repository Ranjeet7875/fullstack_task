import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';


interface Note {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface WebSocketMessage {
  type?: string;
  event?: string;
  notes?: Note[];
  note?: Note;
}

// Main Note App component
export default function NoteApp(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [noteCount, setNoteCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  // Connect to WebSocket server on component mount
  useEffect(() => {
    // Use the same port as your backend is running on
    const newSocket = new WebSocket('ws://localhost:8080');
    
    newSocket.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setConnectionStatus('Connected');
      fetchAllNotes();
    };
    
    newSocket.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      if (data.type === 'notes_updated' && data.notes) {
        setNotes(data.notes);
        setNoteCount(data.notes.length);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      setConnectionStatus('Disconnected - Retrying...');
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        setConnectionStatus('Reconnecting...');
      }, 3000);
    };
    
    newSocket.onerror = (error: Event) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('Connection Error');
    };
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  // Fetch all notes from HTTP endpoint
  const fetchAllNotes = async (): Promise<void> => {
    try {
      // This should match your backend route
      const response = await fetch('http://localhost:8080/fetchAllTasks');
      const data: Note[] = await response.json();
      setNotes(data);
      setNoteCount(data.length);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };
  
  // Add a new note via WebSocket
  const addNote = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newNote.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
    
    const noteObject: Note = {
      id: Date.now().toString(),
      text: newNote,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    socket.send(JSON.stringify({
      event: 'add',
      note: noteObject
    }));
    
    setNewNote('');
  };
  
  // Delete a note
  const deleteNote = (id: string): void => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    const updatedNotes = notes.filter(note => note.id !== id);
    
    socket.send(JSON.stringify({
      event: 'update',
      notes: updatedNotes
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-orange-500 text-white p-1 rounded mr-2">
              <BookOpen size={20} />
            </div>
            <h1 className="text-lg font-bold">Note App</h1>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connectionStatus}
          </div>
        </div>
        
        {/* Add New Note Input */}
        <div className="p-4 border-b border-gray-100 flex">
          <input
            type="text"
            placeholder="New Note..."
            className="flex-grow px-3 py-2 border rounded-l focus:outline-none text-sm"
            value={newNote}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addNote(e)}
            disabled={!isConnected}
          />
          <button
            type="button"
            onClick={addNote}
            className={`text-white px-3 py-2 rounded-r transition-colors ${isConnected ? 'bg-brown-600 hover:bg-brown-700' : 'bg-gray-400'}`}
            style={{ backgroundColor: isConnected ? '#8B4513' : undefined }}
            disabled={!isConnected}
          >
            <span className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add
            </span>
          </button>
        </div>
        
        {/* Notes List */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Notes</h2>
            <span className="text-xs text-gray-500">{noteCount} total</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className="py-2 px-3 border-b border-gray-200 flex justify-between items-center group hover:bg-gray-50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {note.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">
                No notes yet. Add one above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}