from aiohttp import web, WSMsgType

class WSCacheHandler(object):
    __slots__ = ['_handler']

    def __init__(self, *args, **kwargs):
        print('*args: ', args)
        print('**kwargs: ', kwargs)
        custom_handler = kwargs.get('handler', None)
        if custom_handler != None:
            print('Custom handler passed in.')
            self._handler = custom_handler
        else:
            self._handler = self.wshandle

    def handler(self, *args, **kwargs):
        return self._handler(*args, **kwargs)

    async def wshandle(self, request, *args, **kwargs):
        print(vars(request))
        resource = request.match_info['resource']
        print('WS request for \'{}\' resource.'.format(resource))
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                if msg.data == 'close': 
                    await ws.close()
                else:
                    print(msg.data)
                    await ws.send_json(msg.data)
            elif msg.type == WSMsgType.ERROR:
                print('ws connection closed with exception %s' %
                    ws.exception())

        print('websocket connection closed')
        return ws

app = web.Application()
server = WSCacheHandler()
app.add_routes([ web.get('/ws/{resource}/', server.handler) ])

web.run_app(app, port=7000)