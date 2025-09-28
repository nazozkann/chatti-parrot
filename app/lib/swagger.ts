import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chatti Parrot API",
      version: "1.0.0",
      description: "Chatti Parrot proje API dokümantasyonu",
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "Words", description: "Kelime ve kelime grubu yönetimi" },
      {
        name: "User Progress",
        description: "Kullanıcıların kelime çalışma istatistikleri ve ilerleme kayıtları",
      },
    ],
    components: {
      schemas: {
        Word: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66fb2ab1b8a9a45c8a2b0e11" },
            de: { type: "string", example: "Apfel" },
            en: { type: "string", example: "apple" },
            tr: { type: "string", example: "elma" },
            artikel: {
              type: "string",
              enum: ["der", "die", "das"],
              example: "der",
            },
            plural: { type: "string", example: "Äpfel" },
            examples: {
              type: "array",
              items: { type: "string" },
              example: ["Ich esse einen Apfel."],
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A1",
            },
            group: {
              oneOf: [
                { type: "string", example: "66fb2ab1b8a9a45c8a2b0e33" },
                { $ref: "#/components/schemas/WordGroup" },
              ],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-02-01T18:23:11.120Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-02-02T09:12:41.882Z",
            },
          },
          required: ["de", "level", "group"],
        },
        WordCreate: {
          type: "object",
          properties: {
            de: { type: "string", example: "eis" },
            en: { type: "string", example: "ice-cream" },
            tr: { type: "string", example: "dondurma" },
            artikel: {
              type: "string",
              enum: ["der", "die", "das"],
              example: "das",
            },
            plural: { type: "string", example: "Eis" },
            examples: {
              type: "array",
              items: { type: "string" },
              example: ["Ich habe ein Eis."],
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A1",
            },
            groupId: {
              type: "string",
              description: "ObjectId of the word group",
              example: "66fb2ab1b8a9a45c8a2b0e33",
            },
          },
          required: ["de", "level", "groupId"],
        },
        WordUpdate: {
          type: "object",
          properties: {
            de: { type: "string", example: "Haus" },
            en: { type: "string", example: "house" },
            tr: { type: "string", example: "ev" },
            artikel: {
              type: "string",
              enum: ["der", "die", "das"],
              example: "das",
            },
            plural: { type: "string", example: "Häuser" },
            examples: {
              type: "array",
              items: { type: "string" },
              example: ["Das Haus ist groß."],
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A2",
            },
            groupId: {
              type: "string",
              description: "Target word group ObjectId",
              example: "66fb2ab1b8a9a45c8a2b0e34",
            },
          },
        },
        WordGroup: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66fb2ab1b8a9a45c8a2b0e33" },
            name: { type: "string", example: "Numbers" },
            slug: { type: "string", example: "numbers" },
            description: {
              type: "string",
              nullable: true,
              example: "Foundation vocabulary for counting and quantities.",
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A1",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-02-01T18:23:11.120Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-02-02T09:12:41.882Z",
            },
          },
          required: ["_id", "name", "slug", "level"],
        },
        WordGroupCreate: {
          type: "object",
          properties: {
            name: { type: "string", example: "Greeting Basics" },
            slug: { type: "string", example: "greetings" },
            description: {
              type: "string",
              nullable: true,
              example: "Common phrases for polite greetings.",
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A1",
            },
          },
          required: ["name", "slug", "level"],
        },
        WordGroupUpdate: {
          type: "object",
          properties: {
            name: { type: "string", example: "Advanced Greetings" },
            slug: { type: "string", example: "advanced-greetings" },
            description: {
              type: "string",
              nullable: true,
              example: "Formal and situational greetings.",
            },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "B1",
            },
          },
        },
        WordGroupWithWords: {
          allOf: [
            { $ref: "#/components/schemas/WordGroup" },
            {
              type: "object",
              properties: {
                words: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Word" },
                },
              },
            },
          ],
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", example: "66fb2ab1b8a9a45c8a2b0e22" },
            email: { type: "string", example: "learner@example.com" },
            name: { type: "string", nullable: true, example: "Aylin Kaya" },
            username: { type: "string", nullable: true, example: "aylinkaya" },
            firstName: { type: "string", nullable: true, example: "Aylin" },
            lastName: { type: "string", nullable: true, example: "Kaya" },
            avatar: { type: "string", example: "fox" },
            roles: {
              type: "array",
              items: { type: "string" },
              example: ["student"],
            },
            learningLanguages: {
              type: "array",
              items: { type: "string" },
              example: ["de-DE"],
            },
            knownLanguages: {
              type: "array",
              items: { type: "string" },
              example: ["tr-TR"],
            },
          },
          required: [
            "id",
            "email",
            "avatar",
            "roles",
            "learningLanguages",
            "knownLanguages",
          ],
        },
        UserProgressEntry: {
          type: "object",
          properties: {
            wordId: { type: "string", example: "66fb2ab1b8a9a45c8a2b0e11" },
            de: { type: "string", example: "Apfel" },
            en: { type: "string", nullable: true, example: "apple" },
            tr: { type: "string", nullable: true, example: "elma" },
            artikel: {
              type: "string",
              nullable: true,
              enum: ["der", "die", "das"],
              example: "der",
            },
            plural: { type: "string", nullable: true, example: "Äpfel" },
            level: {
              type: "string",
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
              example: "A1",
            },
            totalAttempts: { type: "integer", minimum: 0, example: 12 },
            successCount: { type: "integer", minimum: 0, example: 7 },
            successRate: { type: "integer", minimum: 0, maximum: 100, example: 58 },
            lastAttemptAt: {
              type: "string",
              nullable: true,
              format: "date-time",
              example: "2024-10-12T09:42:11.120Z",
            },
          },
          required: [
            "wordId",
            "de",
            "level",
            "totalAttempts",
            "successCount",
            "successRate",
          ],
        },
        UserProgressPayload: {
          type: "object",
          properties: {
            wordId: {
              type: "string",
              description: "Çalışılan kelimenin ObjectId değeri",
              example: "66fb2ab1b8a9a45c8a2b0e11",
            },
            result: {
              type: "string",
              enum: ["correct", "incorrect"],
              description: "Kullanıcının verdiği cevap sonucu",
              example: "correct",
            },
          },
          required: ["wordId", "result"],
        },
        UserProgressResponse: {
          type: "object",
          properties: {
            learnedWords: {
              type: "array",
              items: { $ref: "#/components/schemas/UserProgressEntry" },
            },
          },
          required: ["learnedWords"],
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Create failed" },
            details: { type: "object", nullable: true },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "İstek gövdesi hatalı / validasyon",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                missing_de: {
                  summary: "'de' alanı eksik",
                  value: {
                    error: "Invalid payload",
                    details: { de: "Required" },
                  },
                },
              },
            },
          },
        },
        Unauthorized: {
          description: "Oturum doğrulanamadı (401)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                unauthenticated: {
                  summary: "Kullanıcı oturum açmamış",
                  value: { error: "Unauthorized", details: null },
                },
              },
            },
          },
        },
        UnprocessableEntity: {
          description: "İş kuralı hatası (422)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                duplicate: {
                  summary: "Aynı kelime var",
                  value: { error: "Word already exists", details: null },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Sunucu hatası (500)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
  apis: ["app/api/**/*.ts"],
});
