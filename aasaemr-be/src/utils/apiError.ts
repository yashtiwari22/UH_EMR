interface ApiErrorprops {
    statusCode: number;
    message: string;
    errors: any[];
    stack: string;
    data: any;
    success: boolean;
  }
  
  const ApiError = (
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ): ApiErrorprops => {
    return {
      statusCode,
      message,
      errors,
      stack: stack || new Error().stack || "",
      data: null,
      success: false,
    };
  };
  
  export default ApiError;
  