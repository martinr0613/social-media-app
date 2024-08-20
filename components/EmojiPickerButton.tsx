import { SmilePlus } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import EmojiPicker, { Theme } from "emoji-picker-react"
import { useTheme } from 'next-themes'

interface EmojiPickerButtonProps {
    onEmojiClick: (emoji: string) => void
}

export default function EmojiPickerButton({onEmojiClick}: EmojiPickerButtonProps) {
  const {theme} = useTheme();

  return (
    <Popover>
        <PopoverTrigger>
            <Button variant="ghost" size="icon" type="button">
                <SmilePlus/>
            </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
            <EmojiPicker 
                theme={theme as Theme} 
                className='absolute left-0' 
                onEmojiClick={(e: any) => onEmojiClick(e.emoji)}/>
        </PopoverContent>
    </Popover>

  )
}
