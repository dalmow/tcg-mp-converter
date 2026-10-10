Two layouts share one 6px track: `compact` and the default label-row layout.

**Compact** (`compact`, used on the deck list cards) drops the label row. It is the bare track with the literal count beside it ("45/60") on the right. The label ("Cartas no deck") stays as the accessible name only, so no label text is visible; the count beside the track is the only visible signal.

**Default** is one label row over one 6px track. The label row is an `eyebrow`-style caption on the left ("Progresso do deck") and the literal count on the right — a bold `ink` number followed by an `ink-subtle` suffix in one text run ("15" + "/60 cartas"). Its `suffix` prop sets the unit; without it the count reads "15/60". No product screen uses the default layout today; it is kept, with its tests, for a label-led progress row.

Neither layout renders a separate "faltam N cartas" sentence duplicating the count. The track is `border-faint`-colored, 3px corner radius, filled left-to-right with `linear-gradient(90deg, danger, primary)` sized to the percentage complete. It carries no panel background or border of its own — it sits directly on whatever surface is behind it.
