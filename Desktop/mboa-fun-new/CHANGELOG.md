# Changelog

All notable changes to Mboa Fun will be documented in this file.

## [2025-05-29] — Release: Cameroonian Rules & Polish

### Check Gems (Crazy Eights)
- **NEW**: Deck expanded to 54 cards (52 + 2 Jokers)
- **NEW**: Card effects updated to Crazy Eights rules:
  - `7` → opponent draws 2 cards
  - `Joker` → opponent draws 4 cards, wildcard color
  - `Jack` → choose new suit
  - `Ace` → player gets another turn
  - Stacking enabled: 7 on 7, Joker on Joker, or 7↔Joker to pass draw penalties
- **NEW**: Cameroonian "CHECK / GAMES" announcement system:
  - Must say "CHECK" before playing the penultimate card (2 cards left)
  - Must say "GAMES" before playing the final card (1 card left)
  - Forgetting to announce → +2 cards penalty
  - Forgetting "GAMES" → victory cancelled, +2 cards
- **NEW**: Hand size reduced to 4 cards (was 7)
- **NEW**: Dealing animation state flags (`dealing`, `dealingIndex`) for future UI animation
- **NEW**: Visual Joker card rendering with star icon and "+4" tag
- **NEW**: Monochrome pawn colors (no black mixed in) for better readability
- **NEW**: Golden border breathing animation on Ludo board
- **NEW**: Realistic dice sound sequence (shake → slam → roll)

### Ludo (Mboa Empire)
- **NEW**: Animated dice roll with 3-phase sound (shake in cup, slam on table, roll to stop)
- **NEW**: 3D SVG pawn design with glossy body, neck ring, spherical head, specular highlight
- **NEW**: Saturated monochrome colors: red (#ef2929), blue (#1e6bff), green (#13b85c), yellow (#f5c211)
- **NEW**: Golden frame glow animation (4.2s breathing effect)
- **NEW**: Pawn hover/selection animations with pulsing aura
- **NEW**: Case-by-case movement with sound effects
- **NEW**: Auto-play when only one legal move exists
- **NEW**: Quiz system foundation (questions file, capture mechanics)
- **NEW**: Pawn capture system (`heldBy`, `isHeld`, `cellHasBarrier`, `stuckTurns`, `joker`)
- **NEW**: Barrier rule for stacked pawns (3 turns stuck)
- **NEW**: Engine updates for advanced gameplay

### Audio System
- **NEW**: Web Audio API sound engine (`sounds.ts`)
- **NEW**: Dice roll sequence with realistic timing
- **NEW**: Pawn step tap sounds
- **NEW**: Master volume control and resume functionality

### UI/UX
- **NEW**: Consistent card styling utilities for light mode
- **NEW**: Responsive design improvements for mobile
- **NEW**: Loading states and empty states
- **NEW**: Toast notifications for game events
- **NEW**: Improved contrast and readability

### Technical
- **NEW**: TypeScript strict mode compliance
- **NEW**: Zustand state management for Check Gems
- **NEW**: Framer Motion animations throughout
- **NEW**: Component architecture with separation of concerns
- **NEW**: SVG-based graphics for scalable UI elements
- **NEW**: CSS-in-JS styling with Tailwind integration

### Bug Fixes
- Fixed card flip animations in Check Gems
- Fixed pawn visibility in Ludo
- Fixed audio context suspension handling
- Fixed responsive layout issues on mobile
- Fixed TypeScript type errors throughout

---

## [2025-05-28] — Initial Release

### Platform
- **NEW**: Multi-game platform (Ludo, Check Gems, Empire, Checkers, Chess, Damier)
- **NEW**: User authentication and profile system
- **NEW**: Lobby and room creation system
- **NEW**: Gem-based currency system
- **NEW**: Responsive mobile-first design

### Ludo (Mboa Empire)
- **NEW**: Full Ludo game implementation
- **NEW**: 4-player support (human + AI)
- **NEW**: Dice rolling mechanics
- **NEW**: Pawn movement and capture
- **NEW**: Safe zones and home columns
- **NEW**: Win condition detection

### Check Gems
- **NEW**: Card game based on Crazy Eights
- **NEW**: AI opponent with basic strategy
- **NEW**: Card matching rules (suit or rank)
- **NEW**: Special cards (7, 2, J, A)
- **NEW**: Draw pile and discard pile mechanics

### Empire (Monopoly-style)
- **NEW**: Cameroon-themed Monopoly game
- **NEW**: 28 property cells with Cameroonian names
- **NEW**: 6 player statuses (Étudiant, Administrateur, etc.)
- **NEW**: Chance and Community Chest cards
- **NEW**: Property buying and selling
- **NEW**: Rent calculation system

### UI/UX
- **NEW**: Dark/light theme toggle
- **NEW**: Custom components library
- **NEW**: Animations and transitions
- **NEW**: Sound effects and music
- **NEW**: Loading screens and progress indicators

---

## Upcoming Features

### Multiplayer
- Real-time multiplayer for all games
- WebSocket integration
- Room invitations and sharing
- Spectator mode
- Tournament system

### Advanced AI
- Difficulty levels (Easy, Normal, Very Hard)
- Machine learning-based opponents
- Adaptive AI strategies
- Personality-based AI behavior

### Social Features
- Friend system
- Chat and messaging
- Leaderboards and rankings
- Achievements and badges
- Profile customization

### Mobile App
- React Native mobile application
- Offline play support
- Push notifications
- Cloud save synchronization
- Touch-optimized controls

---

## Technical Notes

### Architecture
- Frontend: React 19 + TypeScript + Vite
- Backend: Node.js + Express + MongoDB
- Styling: Tailwind CSS + CSS-in-JS
- State: Zustand + React Context
- Animation: Framer Motion
- Audio: Web Audio API

### Performance
- Code splitting by route
- Lazy loading of components
- Image optimization
- Service worker for caching
- Bundle size optimization

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion preferences

---

*For detailed technical documentation, see the README.md and docs/ directory.*
