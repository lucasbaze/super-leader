# Project Setup Log

## January 24, 2024

### Initial Project Setup
1. Used TurboRepo React Native Next.js starter template from Vercel
2. Deployed initial project through Vercel
3. Cloned repository locally
4. Installed dependencies using `yarn`
5. Successfully launched development environment with `yarn dev`

### Development Environment
- Xcode was previously installed, enabling smooth iOS development workflow
- Verified iOS simulator functionality
- Confirmed hot reload functionality working as expected on:
  - Web interface
  - iOS simulator
- Successfully upgraded Expo to latest version
- Installed Expo Go on physical iPhone device
- Verified development build accessibility on personal iPhone through Expo Go
- Implemented GitHub Actions workflow:
  - Configured automatic preview deployment builds
  - Set to trigger on pull requests
  - Streamlines development and review process

### Build Configuration
1. Initiated EAS (Expo Application Services) build setup
2. Successfully created initial development build
3. **Current Blocker**: Apple Developer Account
   - Need to obtain Apple Developer account credentials
   - Required for TestFlight deployment and App Store publishing
   - Currently limited to development builds and Expo environment
   - Research indicates paid Apple Developer account required even for internal distribution[^1]
   - Once account is obtained, can set up internal distribution for team testing

### Current Status
- Development environment: ✅ Functional
- Local testing: ✅ Operational
- Hot reload: ✅ Working
- Build pipeline: ✅ Initial setup complete
- App Store deployment: ⏳ Pending Apple Developer Account
- Expo Go testing: ✅ Working on physical device
- CI/CD: ✅ GitHub Actions configured for preview builds

### Next Steps
1. Obtain Apple Developer Account
2. Configure TestFlight deployment
3. Prepare for App Store submission

[^1]: Reference: [Expo Internal Distribution Documentation](https://docs.expo.dev/build/internal-distribution/)
