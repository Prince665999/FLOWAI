from abc import ABC,abstractmethod
class ShippingProvider(ABC):
 @abstractmethod
 def quote(self,address:dict,items:list[dict])->dict: ...
