%.html: %.md
	pandoc -s $< -o $@

MKD := $(shell find . -name "*.md")
HTML := $(shell find . -name "*.md" | sed -e "s/\.md/.html/g")

.PHONY: all
all: $(HTML)

.DEFAULT_GOAL := all

.PHONY: clean
clean:
	rm $(HTML)
