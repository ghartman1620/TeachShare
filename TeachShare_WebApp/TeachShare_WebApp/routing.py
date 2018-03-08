from channels.routing import ProtocolTypeRouter, ChannelNameRouter
from posts.consumers import PrintConsumer, GarbageTruck

application = ProtocolTypeRouter({
    # Empty for now (http->django views is added by default)
    'channel': ChannelNameRouter({
        'print-sumer': PrintConsumer,
        'garbage-truck': GarbageTruck
    }),
})