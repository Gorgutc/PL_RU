# PL_RU Archive Policy

Archiving is for obsolete instructions, skills, agent specs, and workflow docs
that still explain historical decisions. It is not for secrets, build artifacts,
logs, dependency folders, or generated reports.

## Archive Instead Of Delete

Archive when:

- the content is no longer canonical but still explains how the repo evolved;
- a future audit may need to compare old and new agent behavior;
- a user explicitly asks to preserve obsolete workflow material.

Delete when:

- the file is generated output;
- the file is forbidden by `DO_NOT_PUSH.md`;
- the content is clearly accidental or duplicated with no historical value.

## Archive Metadata

Archived material should include:

- original path;
- archive date;
- reason;
- replacement path or current source of truth.
