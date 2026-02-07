export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(
      (err: any) =>{
        console.error('Error in async function:', err);
        next(err);
      }
      
      );
  };
};
