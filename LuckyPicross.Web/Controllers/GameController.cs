using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AttributeRouting;

namespace LuckyPicross.Web.Controllers
{
    public class GameController : Controller
    {
        [Route("editor")]
        public ActionResult Editor()
        {
            return View();
        }

    }
}
