One layout: a 6px track with the literal count beside it ("45/60") on the right. The deck list tiles are its only consumer.

The label ("Cartas no deck") stays as the accessible name only, so no label text is visible; the count beside the track is the only visible signal. No separate "faltam N cartas" sentence duplicates the count. The track is `border-faint`-colored, 3px corner radius, filled left-to-right with `linear-gradient(90deg, danger, primary)` sized to the percentage complete. It carries no panel background or border of its own — it sits directly on whatever surface is behind it.
