"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (inputValue === value) return options; // show all if not typing
    return options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, options, value]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setInputValue(currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(inputValue)}
              >
                Create "{inputValue}"
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredOptions.length > 0 &&
              !filteredOptions.some(
                (o) => o.toLowerCase() === inputValue.toLowerCase()
              ) &&
              inputValue && (
                <CommandItem onSelect={() => handleSelect(inputValue)}>
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Create "{inputValue}"
                </CommandItem>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
