'use client';

export default function ModelSelector({ selectedModel, onSelectModel }) {
  const models = [
    { id: 'deepseek-r1', name: 'Deepseek R1' },
    { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash' },
    { id: 'claude-3.7', name: 'Claude 3.7' },
    { id: 'claude-3.7-extended', name: 'Claude 3.7 (Extended Thinking)' },
    { id: 'claude-3.5', name: 'Claude 3.5' },
  ];
  
  return (
    <div className="border-b p-4 flex items-center">
      <label className="mr-2 font-medium">Model:</label>
      <select
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}