"""Gemini structured-output schema for ORACLE scene payloads.

The frontend still renders via CopilotKit's ``CanvasScene`` tool. This schema
mirrors that tool contract so Gemini has a native JSON-schema constraint for
scene-shaped output in addition to CopilotKit's function/tool schema.
"""

from __future__ import annotations


ORACLE_SCENE_PROPS_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "scene": {"type": "string", "enum": ["ocean", "storm", "cosmos", "city"]},
        "intensity": {"type": "number", "minimum": 0, "maximum": 1},
        "mood": {
            "type": "string",
            "enum": [
                "calm",
                "tense",
                "critical",
                "volatile",
                "building",
                "crash",
                "expanding",
                "stable",
                "unknown",
                "productive",
                "busy",
                "overloaded",
            ],
        },
        "title": {"type": "string"},
        "metrics": {
            "type": "array",
            "minItems": 3,
            "maxItems": 4,
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "value": {"type": "number", "minimum": 0, "maximum": 1},
                },
                "required": ["label", "value"],
            },
        },
        "message": {"type": "string"},
        "cta": {"type": "string"},
        "ctaPrompt": {"type": "string"},
        "palette": {
            "type": "object",
            "properties": {
                "sky": {"type": "string"},
                "water": {"type": "string"},
                "accent": {"type": "string"},
                "secondary": {"type": "string"},
                "danger": {"type": "string"},
                "text": {"type": "string"},
                "bg": {"type": "string"},
                "nebula": {"type": "string"},
            },
            "required": ["sky", "accent", "secondary"],
        },
        "entities": {
            "type": "array",
            "minItems": 3,
            "maxItems": 4,
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "label": {"type": "string"},
                    "value": {"type": "number", "minimum": 0, "maximum": 1},
                    "role": {"type": "string"},
                },
                "required": ["id", "label", "value"],
            },
        },
        "shipName": {"type": "string"},
        "skyLabel": {"type": "string"},
        "waveLabels": {
            "type": "array",
            "maxItems": 4,
            "items": {"type": "string"},
        },
        "constellation": {
            "type": "object",
            "properties": {
                "nodes": {
                    "type": "array",
                    "maxItems": 8,
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "label": {"type": "string"},
                            "x": {"type": "number", "minimum": 0, "maximum": 1},
                            "y": {"type": "number", "minimum": 0, "maximum": 1},
                            "value": {"type": "number", "minimum": 0, "maximum": 1},
                        },
                        "required": ["id", "label", "x", "y", "value"],
                    },
                },
                "links": {
                    "type": "array",
                    "maxItems": 12,
                    "items": {
                        "type": "object",
                        "properties": {
                            "from": {"type": "string"},
                            "to": {"type": "string"},
                            "strength": {"type": "number", "minimum": 0, "maximum": 1},
                        },
                        "required": ["from", "to"],
                    },
                },
            },
            "required": ["nodes", "links"],
        },
        "nodes": {
            "type": "array",
            "maxItems": 8,
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "x": {"type": "number", "minimum": 0, "maximum": 1},
                    "y": {"type": "number", "minimum": 0, "maximum": 1},
                    "value": {"type": "number", "minimum": 0, "maximum": 1},
                },
                "required": ["label", "x", "y", "value"],
            },
        },
        "connections": {
            "type": "array",
            "maxItems": 12,
            "items": {
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": {"type": "integer"},
            },
        },
        "effects": {
            "type": "object",
            "properties": {
                "foam": {"type": "number", "minimum": 0, "maximum": 1},
                "rain": {"type": "number", "minimum": 0, "maximum": 1},
                "lightning": {"type": "number", "minimum": 0, "maximum": 1},
                "wind": {"type": "number", "minimum": 0, "maximum": 1},
                "starSpeed": {"type": "number", "minimum": 0, "maximum": 1},
                "traffic": {"type": "number", "minimum": 0, "maximum": 1},
                "zoom": {"type": "number", "minimum": 0, "maximum": 1},
            },
        },
    },
    "required": [
        "scene",
        "intensity",
        "mood",
        "title",
        "metrics",
        "message",
        "palette",
        "entities",
    ],
}


ORACLE_CANVAS_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "component": {"type": "string", "enum": ["CanvasScene"]},
        "props": ORACLE_SCENE_PROPS_SCHEMA,
    },
    "required": ["component", "props"],
}
