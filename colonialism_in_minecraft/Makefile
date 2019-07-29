mcm.html: mcm.md sections/*
	pandoc --standalone \
		--include-in-header=../head.html \
		mcm.md \
		sections/intro.md \
		sections/colonialism.md \
		sections/mechanics.md \
		sections/monsters.md \
		sections/terrain.md \
		sections/accumulation.md \
		sections/incentives.md \
		sections/conclusion.md \
	  --output=$@
