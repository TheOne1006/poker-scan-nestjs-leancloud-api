# Implement Game Upload Feature

I will implement the file upload feature for the `games` module as requested, ensuring all validation, security, and storage requirements are met.

## Implementation Steps

1.  **Create Enums**
    *   Create `src/games/dtos/game-enums.ts` to define `DirectionEnum`, `GameRuleEnum`, and `MoveGeneratorEnum` based on the database schema requirements.

2.  **Create DTOs**
    *   Create `src/games/dtos/game-upload.dto.ts`.
    *   Define `GameUploadDto` with all fields (`name`, `supportAppVersion`, `areas`, etc.) and validation rules (`class-validator`).
    *   Implement `areas` validation (parsing JSON string if necessary and checking unique types).
    *   Define `GameUploadDtoWithRSA` extending `GameUploadDto` to include `rsaData`.

3.  **Update Games Controller**
    *   Modify `src/games/games.controller.ts`.
    *   Add `upload` endpoint with `@Post('upload')`.
    *   Use `FileFieldsInterceptor` to handle `backgrounds` and `logo` files.
    *   Configure `multer` `diskStorage` to save files to `public/uploads/backgrounds` and `public/uploads/logos` dynamically based on field name.
    *   Apply `@RSAFields('name', 'adminPassword', 'supportAppVersion')` and `@UseGuards(RSAValidateGuard)` for security.
    *   Use `ValidationPipe` with `transform: true` to ensure correct data types (converting strings to numbers).

4.  **Update Games Service**
    *   Modify `src/games/games.service.ts`.
    *   Implement `upload` method.
    *   Verify `adminPassword` (against a default or env value).
    *   Check for `name` uniqueness.
    *   Create the `Game` entity with the uploaded file paths and parsed data.

5.  **Create Directories**
    *   Ensure `public/uploads/backgrounds` and `public/uploads/logos` directories exist.

## Verification
*   I will create the directories.
*   The code will include strict validation logic.
*   The response will be a simple boolean indicating success.
