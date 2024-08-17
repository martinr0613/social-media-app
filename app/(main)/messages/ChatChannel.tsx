import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, MoveLeft } from "lucide-react";
import { Channel, ChannelHeader, ChannelHeaderProps, MessageInput, MessageList, Window } from "stream-chat-react";

interface ChatChannelProps {
    open: boolean;
    openSideBar: () => void;
}

export default function ChatChannel(
    {open, openSideBar}: ChatChannelProps
) {
  return (
    <div className={
        cn("w-full md:block", !open && "hidden")
    }>
        <Channel>
            <Window>
                <CustomChannelHeader openSidebar={openSideBar}/>
                <MessageList />
                <MessageInput/>
            </Window>
        </Channel>
    </div>
  )
}

interface CustomChannelHeaderProps extends ChannelHeaderProps {
    openSidebar: () => void;
}
function CustomChannelHeader(
    {openSidebar, ...props}: CustomChannelHeaderProps
) {
    return (
        <div className="flex items-center gap-1">
            <div className="h-full p-2 md:hidden">
                <Button size="icon" variant="ghost"
                onClick={openSidebar}>
                    <MoveLeft className="size-5"/>
                </Button>
            </div>
            <ChannelHeader {...props}/>
        </div>

    );
}