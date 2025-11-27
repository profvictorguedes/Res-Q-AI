# Res-Q AI

AI-powered dispatch analysis application for first responders that automatically converts dispatch notes into a visual scene preview.

![Res-Q AI](https://img.shields.io/badge/Res--Q%20AI-Emergency%20Response-red)

## Features

- **🔍 Intelligent Dispatch Analysis**: Automatically extracts key details from dispatch text including location, incident type, hazards, and people involved
- **🗺️ Interactive Map Visualization**: Displays incident location with hazard zones, entry/exit paths on an interactive Leaflet map
- **⚠️ Hazard Detection**: Identifies and categorizes hazards (fire, chemical, structural, electrical, gas) with severity levels
- **🚪 Entry/Exit Path Markers**: Clearly marks recommended entry and exit routes for first responders
- **📱 Mobile-Friendly Interface**: Responsive design optimized for field use on mobile devices
- **⚡ Rapid Loading**: Built with Next.js for fast initial load and smooth interactions
- **🤖 Azure AI Integration**: Optional Azure OpenAI integration for enhanced dispatch analysis

## Supported Hazard Types

| Hazard Type | Detection Keywords | Severity Levels |
|-------------|-------------------|-----------------|
| 🔥 Fire | fire, flames, burning, smoke | Low, Medium, High, Critical |
| ☣️ Chemical | chemical, hazmat, toxic, spill | Low, Medium, High, Critical |
| 🏚️ Structural | structural, collapse, unstable, damaged | Low, Medium, High, Critical |
| ⚡ Electrical | electrical, power line, electrocution | Low, Medium, High, Critical |
| 💨 Gas | gas, propane, natural gas, leak | Low, Medium, High, Critical |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/profvictorguedes/Res-Q-AI.git
cd Res-Q-AI
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Azure AI:
```bash
cp .env.example .env.local
# Edit .env.local with your Azure OpenAI credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## Azure AI Configuration

For enhanced analysis capabilities, configure Azure OpenAI:

1. Create an Azure OpenAI resource in the Azure portal
2. Deploy a GPT model (gpt-4 recommended)
3. Copy your endpoint and API key to `.env.local`:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

## Usage

1. **Enter Dispatch Notes**: Type or paste dispatch notes in the input field
2. **Click Analyze**: The AI processes the text and extracts key information
3. **View Map**: See the incident location, hazards, and entry/exit paths on the map
4. **Review Details**: Check the analysis panel for detailed breakdown of hazards and people involved

### Sample Dispatch Formats

The app understands various dispatch formats:

```
Structure fire at 123 Main Street, New York. 3-story apartment building 
with heavy smoke from upper floors. Multiple residents trapped on 3rd floor. 
Fire spreading rapidly. Gas line nearby. 5 victims reported.
```

```
Chemical spill at 456 Industrial Blvd, Houston. Warehouse facility with 
unknown hazardous materials leaking. Strong fumes detected. 2 workers injured.
```

## API Reference

### POST /api/analyze

Analyzes dispatch text and returns structured incident data.

**Request Body:**
```json
{
  "dispatchText": "Structure fire at 123 Main Street...",
  "useAzureAI": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "originalText": "...",
  "location": {
    "address": "123 Main Street, New York",
    "coordinates": { "lat": 40.7128, "lng": -74.006 },
    "buildingType": "Apartment"
  },
  "incidentType": "Structure Fire",
  "incidentSeverity": "high",
  "hazards": [...],
  "entryExitPaths": [...],
  "peopleInvolved": [...],
  "summary": "...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet, React-Leaflet
- **AI**: Azure OpenAI (optional)

## License

BSD 3-Clause License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This application is designed to assist first responders but should not be the sole basis for emergency response decisions. Always follow established protocols and use professional judgment.
