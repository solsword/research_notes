head.html: poster.css
	echo "<style>" > $@
	cat $< >> $@
	echo "</style>" >> $@

fontawesome.html: solid.css
	echo "<style>" > $@
	cat $< >> $@
	echo "</style>" >> $@

%.html: %.md head.html fontawesome.html
	pandoc --standalone $< --include-in-header="head.html" --include-in-header="fontawesome.html" -o $@

poster.pdf: poster.html
	echo "Sorry, you've got to open in in a browser and print it."

TARGETS := $(shell \
	find . -name "*.md" \
	| grep -v "README.md$$" \
	| sed -e "s/\.md/.html/g")

.PHONY: all
all: $(TARGETS)

.DEFAULT_GOAL := all

.PHONY: clean
clean:
	rm $(TARGETS)
