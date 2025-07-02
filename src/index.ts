import {McpAgent} from "agents/mcp";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {apiClient} from "./utils/ApiClient";
import {Idea} from "./types/Idea";
import {formatIdea, formatMember} from "./utils/FormatResponse";
import {User} from "./types/User";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
    server = new McpServer({
        name: "Authless Calculator",
        version: "1.0.0",
    });

    async init() {
        this.server.tool(
            "get_ideas",
            "Get Ideas from the IdeaScale",
            async () => {
                const ideas = await apiClient.get<Idea[]>("/a/rest/v1/ideas");

                if (!ideas) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Failed to retrieve data.",
                            },
                        ],
                    };
                }

                if (ideas.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No ideas found.",
                            },
                        ],
                    };
                }

                const formattedIdeas = ideas.map(formatIdea);
                const ideasIntoText = `Ideas from the response:\n\n${formattedIdeas.join("\n")}`;

                return {
                    content: [
                        {
                            type: "text",
                            text: ideasIntoText,
                        },
                    ],
                };
            }
        )

        this.server.tool(
            "get_members",
            "Get all members information",
            async () => {
                const members = await apiClient.get<User[]>("/a/rest/v1/members");

                if (!members) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Failed to retrieve data.",
                            },
                        ],
                    };
                }

                if (members.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No members found.",
                            },
                        ],
                    };
                }

                const formattedMembers = members.map(formatMember);
                const membersIntoText = `Members from the response:\n\n${formattedMembers.join("\n")}`;

                return {
                    content: [
                        {
                            type: "text",
                            text: membersIntoText,
                        },
                    ],
                };
            }
        )
    }
}

export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);

        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
        }

        if (url.pathname === "/mcp") {
            return MyMCP.serve("/mcp").fetch(request, env, ctx);
        }

        return new Response("Not found", {status: 404});
    },
};
