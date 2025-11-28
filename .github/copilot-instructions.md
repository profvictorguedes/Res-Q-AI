# Copilot Instructions for Res-Q-AI

## Project Overview

Res-Q-AI is an AI-powered application for first responders that automatically converts dispatch notes into a visual scene preview. The app uses Azure AI services to analyze incoming dispatch text, extract key details, and generate interactive maps.

## Key Features

- Analyze dispatch text using Azure AI services
- Extract key details: location, incident type, hazards, people involved
- Generate interactive maps with hazard highlights
- Mark entry and exit paths
- Mobile-friendly interface with rapid load times

## Development Guidelines

### Code Style

- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Include appropriate comments for complex logic
- Follow consistent formatting throughout the codebase

### Security Considerations

- Never hardcode API keys or secrets
- Use environment variables for sensitive configuration
- Validate all user inputs
- Handle errors gracefully without exposing internal details

### Azure AI Integration

- Use Azure AI services for text analysis and extraction
- Implement proper error handling for API calls
- Cache responses when appropriate to improve performance
- Follow Azure best practices for service integration

### Mobile-First Design

- Prioritize mobile-responsive layouts
- Optimize for fast loading times
- Consider offline capabilities for field use
- Ensure high contrast and readability for emergency situations

### Accessibility

- Ensure the interface is accessible to all users
- Use proper ARIA labels and semantic HTML
- Support screen readers
- Provide alternative text for visual elements

### Testing

- Write unit tests for core functionality
- Include integration tests for Azure AI service calls
- Test on various mobile devices and screen sizes
- Verify map functionality across different browsers

## Project Structure

When adding new features, follow these conventions:

- Keep related files organized in logical directories
- Separate concerns between frontend and backend components
- Use clear naming conventions for files and directories
